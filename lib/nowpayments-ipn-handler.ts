import "server-only";

import { NextResponse } from "next/server";

import { MarzbanError, renewMarzbanUser } from "@/lib/marzban";
import { provisionPaidOrderOnMarzban } from "@/lib/marzban-fulfillment";
import {
  evaluatePaymentAcceptance,
  extractPaymentMeta,
} from "@/lib/nowpayments";
import {
  isUuidOrderId,
  parseVipNowPaymentsOrderId,
} from "@/lib/nowpayments-order-id";
import { resolveMarzbanUsername } from "@/lib/orders";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupabaseOrder } from "@/lib/supabase/types";

export type NowPaymentsIpnResult = {
  status: number;
  body: Record<string, unknown>;
};

function resolveDbOrderId(orderIdRaw: string): {
  dbOrderId: string;
  userId: string | null;
} | null {
  const trimmed = orderIdRaw.trim();
  const vip = parseVipNowPaymentsOrderId(trimmed);
  if (vip) {
    return { dbOrderId: vip.dbOrderId, userId: vip.userId };
  }
  if (isUuidOrderId(trimmed)) {
    return { dbOrderId: trimmed, userId: null };
  }
  return null;
}

const WALLET_TOP_UP_PLAN = "Wallet Top-Up";

async function creditWalletTopUp(
  client: SupabaseClient,
  walletOrder: SupabaseOrder,
  paymentCurrency: string | null,
  txHash: string | null,
): Promise<NowPaymentsIpnResult> {
  const parentOrderId = walletOrder.target_username?.trim() ?? "";
  if (!isUuidOrderId(parentOrderId)) {
    await client
      .from("orders")
      .update({ status: "failed" })
      .eq("id", walletOrder.id);
    return {
      status: 200,
      body: { received: true, error: "invalid_wallet_parent" },
    };
  }

  const { data: parent, error: parentError } = await client
    .from("orders")
    .select("id, wallet_balance_usd, status")
    .eq("id", parentOrderId)
    .maybeSingle();

  if (parentError || !parent || parent.status !== "paid") {
    await client
      .from("orders")
      .update({ status: "failed" })
      .eq("id", walletOrder.id);
    return {
      status: 200,
      body: { received: true, error: "wallet_parent_not_paid" },
    };
  }

  const credit = Number(walletOrder.amount) || 0;
  const currentBalance = Number(parent.wallet_balance_usd) || 0;

  const { error: parentUpdateError } = await client
    .from("orders")
    .update({ wallet_balance_usd: currentBalance + credit })
    .eq("id", parentOrderId);

  if (parentUpdateError) {
    return {
      status: 200,
      body: { received: true, error: "wallet_credit_failed" },
    };
  }

  await client
    .from("orders")
    .update({
      status: "paid",
      payment_currency: paymentCurrency,
      tx_hash: txHash,
      payment_provider: "nowpayments",
    })
    .eq("id", walletOrder.id);

  return {
    status: 200,
    body: {
      received: true,
      success: true,
      wallet_credit: credit,
      parent_order_id: parentOrderId,
    },
  };
}

/** Unified NOWPayments IPN fulfillment — renewals, wallet, underpaid, provisioning. */
export async function processNowPaymentsIpn(
  client: SupabaseClient,
  payload: Record<string, unknown>,
  logPrefix = "[nowpayments IPN]",
): Promise<NowPaymentsIpnResult> {
  const orderIdRaw =
    typeof payload.order_id === "string"
      ? payload.order_id
      : typeof payload.order_id === "number"
        ? String(payload.order_id)
        : "";

  const acceptance = evaluatePaymentAcceptance(payload);
  const { paymentCurrency, txHash } = extractPaymentMeta(payload);

  if (!orderIdRaw) {
    return { status: 400, body: { error: "Missing order_id" } };
  }

  const resolved = resolveDbOrderId(orderIdRaw);
  if (!resolved) {
    console.error(`${logPrefix} Unparseable order_id:`, orderIdRaw);
    return { status: 200, body: { received: true, error: "invalid_order_id" } };
  }

  const { data: existing, error: fetchError } = await client
    .from("orders")
    .select("*")
    .eq("id", resolved.dbOrderId)
    .maybeSingle();

  if (fetchError || !existing) {
    console.error(`${logPrefix} Order not found:`, resolved.dbOrderId);
    return { status: 404, body: { error: "Order not found" } };
  }

  const order = existing as SupabaseOrder;

  if (resolved.userId && order.user_id && order.user_id !== resolved.userId) {
    console.error(`${logPrefix} user_id mismatch`);
    return { status: 200, body: { received: true, error: "user_mismatch" } };
  }

  if (order.plan_name === WALLET_TOP_UP_PLAN) {
    if (order.status === "paid") {
      return {
        status: 200,
        body: { received: true, message: "Wallet order already settled" },
      };
    }
    if (acceptance === "fulfill") {
      return creditWalletTopUp(client, order, paymentCurrency, txHash);
    }
  }

  if (order.status === "paid" && resolveMarzbanUsername(order)) {
    return {
      status: 200,
      body: {
        received: true,
        message: "Already provisioned",
        order_id: resolved.dbOrderId,
      },
    };
  }

  if (acceptance === "failed") {
    await client
      .from("orders")
      .update({ status: "failed" })
      .eq("id", resolved.dbOrderId);
    return { status: 200, body: { success: true, message: "Marked failed" } };
  }

  if (acceptance === "underpaid") {
    await client
      .from("orders")
      .update({ status: "underpaid" })
      .eq("id", resolved.dbOrderId);
    return { status: 200, body: { success: true, message: "Marked underpaid" } };
  }

  if (acceptance === "ignored") {
    return {
      status: 200,
      body: { success: true, message: "Ignored payment status" },
    };
  }

  try {
    const isRenewal = Boolean(order.is_renewal);
    const targetUsername = order.target_username?.trim() ?? null;

    let username: string;
    let sub_link: string;

    if (isRenewal && targetUsername) {
      const renewed = await renewMarzbanUser(targetUsername, order.plan_name);
      username = renewed.username;
      sub_link = renewed.sub_link;
    } else {
      const provisioned = await provisionPaidOrderOnMarzban(
        order.plan_name,
        resolved.dbOrderId,
      );
      username = provisioned.username;
      sub_link = provisioned.sub_link;
    }

    const { error: updateError } = await client
      .from("orders")
      .update({
        status: "paid",
        user_id: order.user_id ?? resolved.userId ?? null,
        vpn_username: username,
        marzban_username: username,
        vpn_sub_link: sub_link,
        payment_currency: paymentCurrency,
        tx_hash: txHash,
        payment_provider: "nowpayments",
      })
      .eq("id", resolved.dbOrderId);

    if (updateError) {
      console.error(`${logPrefix} Supabase update failed:`, updateError.message);
      return {
        status: 500,
        body: { error: "Order update failed" },
      };
    }

    return {
      status: 200,
      body: {
        received: true,
        success: true,
        order_id: resolved.dbOrderId,
        username,
        renewal: isRenewal,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof MarzbanError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Provisioning failed";

    console.error(`${logPrefix} Marzban error:`, message);

    await client
      .from("orders")
      .update({ status: "failed" })
      .eq("id", resolved.dbOrderId);

    return { status: 500, body: { error: message } };
  }
}

export function nowPaymentsIpnToResponse(result: NowPaymentsIpnResult): NextResponse {
  return NextResponse.json(result.body, { status: result.status });
}
