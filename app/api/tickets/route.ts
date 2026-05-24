import { NextResponse } from "next/server";

import { assertOrderAccess } from "@/lib/order-access";
import { formatTicketDbError } from "@/lib/ticket-db-errors";
import { isValidUuid } from "@/lib/uuid";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: Request) {
  const db = requireSupabaseAdmin();
  if (!db.ok) {
    return db.response;
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id")?.trim() ?? "";

  if (!isValidUuid(orderId)) {
    return jsonError("Invalid or missing order_id", 400);
  }

  const access = await assertOrderAccess(orderId);
  if (!access.ok) {
    return jsonError(access.error, access.status);
  }

  const { data: tickets, error } = await db.client
    .from("tickets")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError(formatTicketDbError(error.message), 500);
  }

  return NextResponse.json({ success: true, tickets: tickets ?? [] });
}

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

  const order_id =
    typeof body === "object" &&
    body !== null &&
    "order_id" in body &&
    typeof (body as { order_id: unknown }).order_id === "string"
      ? (body as { order_id: string }).order_id.trim()
      : "";

  const subject =
    typeof body === "object" &&
    body !== null &&
    "subject" in body &&
    typeof (body as { subject: unknown }).subject === "string"
      ? (body as { subject: string }).subject.trim()
      : "";

  const message =
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
      ? (body as { message: string }).message.trim()
      : "";

  if (!isValidUuid(order_id)) {
    return jsonError("Invalid or missing order_id", 400);
  }

  if (!subject || subject.length > 200) {
    return jsonError("Invalid or missing subject", 400);
  }

  if (!message || message.length < 10 || message.length > 5000) {
    return jsonError("Message must be between 10 and 5000 characters", 400);
  }

  const access = await assertOrderAccess(order_id);
  if (!access.ok) {
    return jsonError(access.error, access.status);
  }

  const { data: order } = await db.client
    .from("orders")
    .select("id, status")
    .eq("id", order_id)
    .maybeSingle();

  if (!order) {
    return jsonError("Order not found", 404);
  }

  if (order.status !== "paid") {
    return jsonError("Only active paid nodes can open support tickets", 400);
  }

  const { data: ticket, error } = await db.client
    .from("tickets")
    .insert({
      order_id,
      subject,
      message,
      status: "open",
    })
    .select("*")
    .single();

  if (error || !ticket) {
    return jsonError(
      formatTicketDbError(error?.message ?? "Failed to create ticket"),
      500,
    );
  }

  return NextResponse.json({ success: true, ticket });
}
