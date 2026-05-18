import { NextResponse } from "next/server";

import { isAllowedPlan } from "@/lib/marzban";
import { createNowPaymentsInvoice } from "@/lib/nowpayments-invoice";
import { resolvePlanAmountUsd } from "@/lib/plan-pricing";
import type { SupabaseOrder } from "@/lib/supabase/types";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";
import { isValidUuid } from "@/lib/uuid";
import { jsonError } from "@/lib/api/json-error";

export async function POST(request: Request) {
  const db = requireSupabaseAdmin();
  if (!db.ok) {
    return db.response;
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

  const billing =
    typeof body === "object" &&
    body !== null &&
    "billing" in body &&
    (body as { billing: unknown }).billing === "annual"
      ? "annual"
      : "monthly";

  if (!orderId || !isValidUuid(orderId)) {
    return jsonError("Invalid or missing order_id", 400);
  }

  if (!planName || !isAllowedPlan(planName)) {
    return jsonError("Invalid or missing planName", 400);
  }

  const amount = resolvePlanAmountUsd(planName, billing);
  if (amount === null || amount <= 0) {
    return jsonError("Unknown plan pricing", 400);
  }

  const { data: parentOrder, error: fetchError } = await db.client
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

  const { data: renewalOrder, error: insertError } = await db.client
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
    await db.client
      .from("orders")
      .update({ status: "failed" })
      .eq("id", renewalOrderId);
    return jsonError(
      e instanceof Error ? e.message : "Invoice creation failed",
      502,
    );
  }
}
