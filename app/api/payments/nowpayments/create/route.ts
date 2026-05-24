import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/json-error";
import { getAppUrl } from "@/lib/app-url";
import {
  resolveMarketingPlanName,
  resolveMarketingPlanPrice,
} from "@/lib/marketing-pricing";
import { createAppNowPaymentsInvoice } from "@/lib/nowpayments-invoice-app";
import { buildVipNowPaymentsOrderId } from "@/lib/nowpayments-order-id";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";
import { isValidUuid } from "@/lib/uuid";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return jsonError("Authentication service unavailable", 503);
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return jsonError("Unauthorized — sign in to generate an invoice", 401);
  }

  const db = requireSupabaseAdmin();
  if (!db.ok) {
    return db.response;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const planName =
    typeof body === "object" &&
    body !== null &&
    "planName" in body &&
    typeof (body as { planName: unknown }).planName === "string"
      ? (body as { planName: string }).planName.trim()
      : "";

  const tierType =
    typeof body === "object" &&
    body !== null &&
    "tierType" in body &&
    ((body as { tierType: unknown }).tierType === "b2c" ||
      (body as { tierType: unknown }).tierType === "proxy")
      ? (body as { tierType: "b2c" | "proxy" }).tierType
      : null;

  const tierId =
    typeof body === "object" &&
    body !== null &&
    "tierId" in body &&
    typeof (body as { tierId: unknown }).tierId === "string"
      ? (body as { tierId: string }).tierId
      : "";

  const existingOrderId =
    typeof body === "object" &&
    body !== null &&
    "orderId" in body &&
    typeof (body as { orderId: unknown }).orderId === "string"
      ? (body as { orderId: string }).orderId.trim()
      : "";

  let amountUsd =
    typeof body === "object" &&
    body !== null &&
    "amountUsd" in body &&
    typeof (body as { amountUsd: unknown }).amountUsd === "number"
      ? (body as { amountUsd: number }).amountUsd
      : NaN;

  let resolvedPlanName = planName;

  if (tierType && tierId) {
    const name = resolveMarketingPlanName(tierType, tierId);
    const price = resolveMarketingPlanPrice(tierType, tierId);
    if (!name || price === null) {
      return jsonError("Invalid tier", 400);
    }
    resolvedPlanName = name;
    amountUsd = price;
  }

  if (!resolvedPlanName && existingOrderId) {
    resolvedPlanName = "Wallet Top-Up";
  }

  if (!resolvedPlanName || !Number.isFinite(amountUsd) || amountUsd < 1) {
    return jsonError("Valid planName/tier or orderId + amountUsd required", 400);
  }

  let dbOrderId = existingOrderId;
  const isWalletTopUp =
    Boolean(existingOrderId) &&
    !tierType &&
    !planName &&
    Number.isFinite(amountUsd) &&
    amountUsd >= 1;

  if (isWalletTopUp) {
    if (!isValidUuid(existingOrderId)) {
      return jsonError("Invalid orderId", 400);
    }
    const { data: parent } = await db.client
      .from("orders")
      .select("id, status, user_id")
      .eq("id", existingOrderId)
      .maybeSingle();

    if (!parent || parent.status !== "paid") {
      return jsonError("Active paid order required for wallet top-up", 400);
    }
    if (parent.user_id && parent.user_id !== user.id) {
      return jsonError("Order does not belong to this account", 403);
    }

    const { data: walletOrder, error: walletInsertError } = await db.client
      .from("orders")
      .insert({
        plan_name: "Wallet Top-Up",
        amount: amountUsd,
        status: "pending",
        user_id: user.id,
        target_username: existingOrderId,
        is_renewal: false,
      })
      .select("id")
      .single();

    if (walletInsertError || !walletOrder?.id) {
      return jsonError("Could not create wallet deposit order", 500);
    }

    dbOrderId = walletOrder.id as string;
    resolvedPlanName = "Wallet Top-Up";
  } else if (dbOrderId) {
    if (!isValidUuid(dbOrderId)) {
      return jsonError("Invalid orderId", 400);
    }
    const { data: existing } = await db.client
      .from("orders")
      .select("id, status, user_id")
      .eq("id", dbOrderId)
      .maybeSingle();

    if (!existing) {
      return jsonError("Order not found", 404);
    }
    if (existing.user_id && existing.user_id !== user.id) {
      return jsonError("Order does not belong to this account", 403);
    }
    if (!existing.user_id) {
      await db.client
        .from("orders")
        .update({ user_id: user.id })
        .eq("id", dbOrderId);
    }
  } else {
    const { data: order, error: insertError } = await db.client
      .from("orders")
      .insert({
        plan_name: resolvedPlanName,
        amount: amountUsd,
        status: "pending",
        is_renewal: false,
        user_id: user.id,
      })
      .select("id")
      .single();

    if (insertError || !order?.id) {
      return jsonError("Could not create order", 500);
    }
    dbOrderId = order.id as string;
  }

  const nowpaymentsOrderId = buildVipNowPaymentsOrderId(user.id, dbOrderId);

  try {
    const appUrl = getAppUrl();
    const invoice_url = await createAppNowPaymentsInvoice({
      nowpaymentsOrderId,
      amount: amountUsd,
      description: `IPNOVA — ${resolvedPlanName}`,
      successPath: "/dashboard?payment=success",
    });

    return NextResponse.json({
      success: true,
      invoice_url,
      order_id: dbOrderId,
      nowpayments_order_id: nowpaymentsOrderId,
      ipn_callback_url: `${appUrl}/api/webhooks/nowpayments`,
    });
  } catch (e) {
    if (!existingOrderId || isWalletTopUp) {
      await db.client.from("orders").update({ status: "failed" }).eq("id", dbOrderId);
    }
    return jsonError(
      e instanceof Error ? e.message : "Invoice creation failed",
      502,
    );
  }
}
