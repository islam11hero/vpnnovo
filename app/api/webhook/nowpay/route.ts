import { NextResponse } from "next/server";

import {
  MarzbanError,
  provisionMarzbanUser,
  renewMarzbanUser,
} from "@/lib/marzban";
import {
  evaluatePaymentAcceptance,
  extractPaymentMeta,
  verifyNowPaymentsSignature,
} from "@/lib/nowpayments";
import type { SupabaseOrder } from "@/lib/supabase/types";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!ipnSecret) {
    console.error("[nowpay IPN] NOWPAYMENTS_IPN_SECRET is not configured");
    return NextResponse.json({ error: "IPN not configured" }, { status: 500 });
  }

  const db = requireSupabaseAdmin();
  if (!db.ok) {
    console.error("[nowpay IPN] Supabase not configured", db.response);
    return db.response;
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const signature = request.headers.get("x-nowpayments-sig");
  if (!verifyNowPaymentsSignature(payload, signature, ipnSecret)) {
    console.error("[nowpay IPN] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const orderId =
    typeof payload.order_id === "string"
      ? payload.order_id
      : typeof payload.order_id === "number"
        ? String(payload.order_id)
        : null;

  if (!orderId) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  const acceptance = evaluatePaymentAcceptance(payload);
  const { paymentCurrency, txHash } = extractPaymentMeta(payload);

  const { data: existing, error: fetchError } = await db.client
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError || !existing) {
    console.error("[nowpay IPN] Order not found:", orderId);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = existing as SupabaseOrder;

  if (order.status === "paid" && order.vpn_username) {
    return NextResponse.json({ success: true, message: "Already provisioned" });
  }

  if (acceptance === "failed") {
    await db.client
      .from("orders")
      .update({ status: "failed" })
      .eq("id", orderId);
    return NextResponse.json({ success: true, message: "Marked failed" });
  }

  if (acceptance === "underpaid") {
    await db.client
      .from("orders")
      .update({ status: "underpaid" })
      .eq("id", orderId);
    return NextResponse.json({ success: true, message: "Marked underpaid" });
  }

  if (acceptance === "ignored") {
    return NextResponse.json({
      success: true,
      message: "Ignored payment status",
    });
  }

  try {
    const isRenewal = Boolean(order.is_renewal);
    const targetUsername = order.target_username ?? null;

    let username: string;
    let sub_link: string;

    if (isRenewal && targetUsername) {
      const renewed = await renewMarzbanUser(targetUsername, order.plan_name);
      username = renewed.username;
      sub_link = renewed.sub_link;
    } else {
      const provisioned = await provisionMarzbanUser(order.plan_name);
      username = provisioned.username;
      sub_link = provisioned.sub_link;
    }

    const { error: updateError } = await db.client
      .from("orders")
      .update({
        status: "paid",
        vpn_username: username,
        vpn_sub_link: sub_link,
        payment_currency: paymentCurrency,
        tx_hash: txHash,
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("[nowpay IPN] Supabase update failed:", updateError.message);
      return NextResponse.json(
        { error: "Order update failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      order_id: orderId,
      username,
      renewal: isRenewal,
    });
  } catch (error: unknown) {
    const message =
      error instanceof MarzbanError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Provisioning failed";

    console.error("[nowpay IPN] Marzban error:", message);

    await db.client
      .from("orders")
      .update({ status: "failed" })
      .eq("id", orderId);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
