import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/json-error";
import { isAllowedPlan } from "@/lib/marzban";
import { createNowPaymentsInvoice } from "@/lib/nowpayments-invoice";
import { resolvePlanAmountUsd } from "@/lib/plan-pricing";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";

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

  const planName =
    typeof body === "object" &&
    body !== null &&
    "planName" in body &&
    typeof (body as { planName: unknown }).planName === "string"
      ? (body as { planName: string }).planName.trim()
      : "";

  const billingRaw =
    typeof body === "object" &&
    body !== null &&
    "billing" in body &&
    typeof (body as { billing: unknown }).billing === "string"
      ? (body as { billing: string }).billing
      : "monthly";

  const billing =
    billingRaw === "sovereign"
      ? "sovereign"
      : billingRaw === "annual"
        ? "annual"
        : "monthly";

  if (!planName || !isAllowedPlan(planName)) {
    return jsonError("Invalid or missing planName", 400);
  }

  const amount = resolvePlanAmountUsd(planName, billing);
  if (amount === null || amount <= 0) {
    return jsonError("Unknown plan pricing", 400);
  }

  const { data: order, error: insertError } = await db.client
    .from("orders")
    .insert({
      plan_name: planName,
      amount,
      status: "pending",
      is_renewal: false,
    })
    .select("id")
    .single();

  if (insertError || !order?.id) {
    return jsonError(
      "Could not start checkout. Please try again in a moment.",
      500,
    );
  }

  const orderId = order.id as string;

  try {
    const paymentUrl = await createNowPaymentsInvoice({
      orderId,
      amount,
      planName,
    });

    return NextResponse.json({
      success: true,
      payment_url: paymentUrl,
      order_id: orderId,
    });
  } catch (e) {
    await db.client
      .from("orders")
      .update({ status: "failed" })
      .eq("id", orderId);
    return jsonError(
      e instanceof Error ? e.message : "Invoice creation failed",
      502,
    );
  }
}
