import { NextResponse } from "next/server";

/** Primary checkout — anonymous NOWPayments crypto invoices. */

import { jsonError } from "@/lib/api/json-error";
import {
  isCheckoutPlanAllowed,
  resolveCryptoCheckoutPlan,
} from "@/lib/checkout-plans";
import { createNowPaymentsInvoice } from "@/lib/nowpayments-invoice";
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

  const tierType =
    typeof body === "object" &&
    body !== null &&
    "tierType" in body &&
    ((body as { tierType: unknown }).tierType === "b2c" ||
      (body as { tierType: unknown }).tierType === "proxy")
      ? (body as { tierType: "b2c" | "proxy" }).tierType
      : undefined;

  const tierId =
    typeof body === "object" &&
    body !== null &&
    "tierId" in body &&
    typeof (body as { tierId: unknown }).tierId === "string"
      ? (body as { tierId: string }).tierId.trim()
      : undefined;

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

  const resolved = resolveCryptoCheckoutPlan({
    planName: planName || undefined,
    tierType,
    tierId,
    billing,
  });

  if (!resolved || !isCheckoutPlanAllowed(resolved.planName)) {
    return jsonError("Invalid or missing plan", 400);
  }

  const { planName: resolvedPlanName, amountUsd: amount } = resolved;

  const { data: order, error: insertError } = await db.client
    .from("orders")
    .insert({
      plan_name: resolvedPlanName,
      amount,
      status: "pending",
      is_renewal: false,
      payment_provider: "nowpayments",
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
      planName: resolvedPlanName,
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
