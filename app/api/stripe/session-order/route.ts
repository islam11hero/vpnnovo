import { NextResponse } from "next/server";

import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Public lookup after Stripe Payment Link — returns IPNOVA order id for portal access. */
export async function GET(request: Request) {
  const db = requireSupabaseAdmin();
  if (!db.ok) {
    return db.response;
  }

  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim();
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json(
      { success: false, error: "Invalid session_id" },
      { status: 400 },
    );
  }

  const { data: order, error } = await db.client
    .from("orders")
    .select("id, status, plan_name, payment_provider")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  if (!order?.id) {
    return NextResponse.json(
      {
        success: false,
        pending: true,
        error: "Order not ready — webhook may still be processing",
      },
      { status: 404 },
    );
  }

  if (order.status !== "paid") {
    return NextResponse.json({
      success: false,
      pending: true,
      order_id: order.id,
      status: order.status,
    });
  }

  return NextResponse.json({
    success: true,
    order_id: order.id as string,
    plan_name: order.plan_name,
    payment_provider: order.payment_provider,
  });
}
