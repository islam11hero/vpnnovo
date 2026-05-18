import { NextResponse } from "next/server";

import { isAllowedPlan } from "@/lib/marzban";
import { createNowPaymentsInvoice } from "@/lib/nowpayments-invoice";
import { supabaseAdmin } from "@/lib/supabase";

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

  if (!planName || !isAllowedPlan(planName)) {
    return jsonError("Invalid or missing planName", 400);
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return jsonError("Invalid or missing amount", 400);
  }

  const { data: order, error: insertError } = await supabaseAdmin
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
      insertError?.message ?? "Failed to create order in Supabase",
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
    await supabaseAdmin
      .from("orders")
      .update({ status: "failed" })
      .eq("id", orderId);
    return jsonError(
      e instanceof Error ? e.message : "Invoice creation failed",
      502,
    );
  }
}
