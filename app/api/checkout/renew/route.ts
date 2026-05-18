import { NextResponse } from "next/server";

import { isAllowedPlan } from "@/lib/marzban";
import { createNowPaymentsInvoice } from "@/lib/nowpayments-invoice";
import { supabaseAdmin, type SupabaseOrder } from "@/lib/supabase";
import { isValidUuid } from "@/lib/uuid";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return jsonError("Supabase admin client is not configured", 500);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const orderId =
    typeof body === "object" &&
    body !== null &&
    "order_id" in body &&
    typeof (body as { order_id: unknown }).order_id === "string"
      ? (body as { order_id: string }).order_id.trim()
      : "";

  const planName =
    typeof body === "object" &&
    body !== null &&
    "planName" in body &&
    typeof (body as { planName: unknown }).planName === "string"
      ? (body as { planName: string }).planName.trim()
      : "";

  const amount =
    typeof body === "object" &&
    body !== null &&
    "amount" in body &&
    typeof (body as { amount: unknown }).amount === "number"
      ? (body as { amount: number }).amount
      : NaN;

  if (!orderId || !isValidUuid(orderId)) {
    return jsonError("Invalid or missing order_id", 400);
  }

  if (!planName || !isAllowedPlan(planName)) {
    return jsonError("Invalid or missing planName", 400);
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return jsonError("Invalid or missing amount", 400);
  }

  const { data: parentOrder, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError || !parentOrder) {
    return jsonError("Original order not found", 404);
  }

  const parent = parentOrder as SupabaseOrder;

  if (parent.status !== "paid" || !parent.vpn_username) {
    return jsonError("Only active paid shields can be renewed", 400);
  }

  const { data: renewalOrder, error: insertError } = await supabaseAdmin
    .from("orders")
    .insert({
      plan_name: planName,
      amount,
      status: "pending",
      is_renewal: true,
      target_username: parent.vpn_username,
    })
    .select("id")
    .single();

  if (insertError || !renewalOrder?.id) {
    return jsonError(
      insertError?.message ?? "Failed to create renewal order",
      500,
    );
  }

  const renewalOrderId = renewalOrder.id as string;

  try {
    const paymentUrl = await createNowPaymentsInvoice({
      orderId: renewalOrderId,
      amount,
      planName,
      description: `IPNOVA Renewal - ${planName} (${parent.vpn_username})`,
    });

    return NextResponse.json({
      success: true,
      payment_url: paymentUrl,
      order_id: renewalOrderId,
    });
  } catch (e) {
    await supabaseAdmin
      .from("orders")
      .update({ status: "failed" })
      .eq("id", renewalOrderId);
    return jsonError(
      e instanceof Error ? e.message : "Invoice creation failed",
      502,
    );
  }
}
