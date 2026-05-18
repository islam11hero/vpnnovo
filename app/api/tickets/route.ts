import { NextResponse } from "next/server";

import { isValidUuid } from "@/lib/uuid";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return jsonError("Database not configured", 500);
  }

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id")?.trim() ?? "";

  if (!isValidUuid(orderId)) {
    return jsonError("Invalid or missing order_id", 400);
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) {
    return jsonError("Order not found", 404);
  }

  const { data: tickets, error } = await supabaseAdmin
    .from("tickets")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError(error.message, 500);
  }

  return NextResponse.json({ success: true, tickets: tickets ?? [] });
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return jsonError("Database not configured", 500);
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

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, status")
    .eq("id", order_id)
    .maybeSingle();

  if (!order) {
    return jsonError("Order not found", 404);
  }

  const { data: ticket, error } = await supabaseAdmin
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
    return jsonError(error?.message ?? "Failed to create ticket", 500);
  }

  return NextResponse.json({ success: true, ticket });
}
