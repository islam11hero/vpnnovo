import "server-only";

import type Stripe from "stripe";

import { provisionPaidOrderOnMarzban } from "@/lib/marzban-fulfillment";
import { MarzbanError } from "@/lib/marzban-error";
import { updateOrderVpnFields } from "@/lib/order-vpn-update";
import { resolveStripePlanFromSession } from "@/lib/stripe-plan-map";
import type { SupabaseClient } from "@supabase/supabase-js";

export type StripeFulfillmentResult =
  | { ok: true; orderId: string; username: string; existing: boolean }
  | { ok: false; error: string };

export async function fulfillStripeCheckoutSession(
  client: SupabaseClient,
  session: Stripe.Checkout.Session,
  lineItems: Stripe.LineItem[],
): Promise<StripeFulfillmentResult> {
  const sessionId = session.id;
  if (!sessionId) {
    return { ok: false, error: "Missing session id" };
  }

  const { data: existingBySession } = await client
    .from("orders")
    .select("id, vpn_username, marzban_username")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (existingBySession?.id) {
    return {
      ok: true,
      orderId: existingBySession.id as string,
      username:
        (existingBySession.marzban_username as string | null) ??
        (existingBySession.vpn_username as string | null) ??
        "",
      existing: true,
    };
  }

  const firstItem = lineItems[0];
  const productName =
    typeof firstItem?.description === "string"
      ? firstItem.description
      : typeof firstItem?.price?.product === "object" &&
          firstItem.price.product &&
          "name" in firstItem.price.product
        ? String((firstItem.price.product as { name?: string }).name ?? "")
        : null;

  const plan = resolveStripePlanFromSession({
    metadata: session.metadata ?? undefined,
    productName,
    description: firstItem?.description ?? null,
    amountTotalCents: session.amount_total,
  });

  if (!plan) {
    return { ok: false, error: "Could not map Stripe product to IPNOVA plan" };
  }

  const amountUsd =
    plan.amountUsd > 0
      ? plan.amountUsd
      : session.amount_total
        ? session.amount_total / 100
        : 0;

  const customerEmail =
    session.customer_details?.email ??
    session.customer_email ??
    null;

  const { data: inserted, error: insertError } = await client
    .from("orders")
    .insert({
      plan_name: plan.planName,
      amount: amountUsd,
      status: "pending",
      payment_provider: "stripe",
      stripe_session_id: sessionId,
      tx_hash: session.payment_intent
        ? String(session.payment_intent)
        : sessionId,
    })
    .select("id")
    .single();

  if (insertError || !inserted?.id) {
    return { ok: false, error: insertError?.message ?? "Order insert failed" };
  }

  const orderId = inserted.id as string;

  try {
    const { username, sub_link } = await provisionPaidOrderOnMarzban(
      plan.planName,
      orderId,
    );

    const updateResult = await updateOrderVpnFields(client, orderId, {
      username,
      subLink: sub_link,
      status: "paid",
      paymentCurrency: "stripe",
      txHash: session.payment_intent
        ? String(session.payment_intent)
        : sessionId,
      paymentProvider: "stripe",
    });

    if (!updateResult.ok) {
      throw new Error(updateResult.error);
    }

    void customerEmail;

    return { ok: true, orderId, username, existing: false };
  } catch (e) {
    await client.from("orders").update({ status: "failed" }).eq("id", orderId);
    const message =
      e instanceof MarzbanError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Provisioning failed";
    return { ok: false, error: message };
  }
}
