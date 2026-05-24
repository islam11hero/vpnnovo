import { NextResponse } from "next/server";
import Stripe from "stripe";

import { fulfillStripeCheckoutSession } from "@/lib/stripe-fulfillment";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe || !webhookSecret) {
    console.error("[stripe webhook] STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET missing");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const db = requireSupabaseAdmin();
  if (!db.ok) {
    return db.response;
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const rawBody = await request.text();

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe webhook] Signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, skipped: true });
    }

    let lineItems: Stripe.LineItem[] = [];
    try {
      const listed = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 5,
      });
      lineItems = listed.data;
    } catch (e) {
      console.warn("[stripe webhook] Could not list line items:", e);
    }

    const result = await fulfillStripeCheckoutSession(
      db.client,
      session,
      lineItems,
    );

    if (!result.ok) {
      console.error("[stripe webhook] Fulfillment failed:", result.error);
      return NextResponse.json(
        { received: true, error: result.error },
        { status: 500 },
      );
    }

    console.info(
      "[stripe webhook] Provisioned",
      result.orderId,
      result.username,
      result.existing ? "(existing)" : "",
    );

    return NextResponse.json({
      received: true,
      order_id: result.orderId,
      existing: result.existing,
    });
  }

  return NextResponse.json({ received: true });
}
