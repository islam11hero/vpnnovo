import { NextResponse } from "next/server";

import type { SupportTicketWithOrder } from "@/lib/tickets";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

type OrderJoin = {
  vpn_username: string | null;
  plan_name: string | null;
};

function parseOrderJoin(orders: unknown): OrderJoin | null {
  if (!orders) return null;
  if (Array.isArray(orders)) {
    const first = orders[0];
    return first && typeof first === "object" ? (first as OrderJoin) : null;
  }
  if (typeof orders === "object") {
    return orders as OrderJoin;
  }
  return null;
}

export async function GET() {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  const db = requireSupabaseAdmin();
  if (!db.ok) {
    return db.response;
  }

  const { data, error } = await db.client
    .from("tickets")
    .select(
      `
      id,
      order_id,
      subject,
      message,
      status,
      admin_reply,
      created_at,
      updated_at,
      orders:order_id (
        vpn_username,
        plan_name
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError(error.message, 500);
  }

  const tickets: SupportTicketWithOrder[] = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const order = parseOrderJoin(r.orders);
    return {
      id: String(r.id),
      order_id: String(r.order_id),
      subject: String(r.subject),
      message: String(r.message),
      status: String(r.status) as SupportTicketWithOrder["status"],
      admin_reply: (r.admin_reply as string | null) ?? null,
      created_at: String(r.created_at),
      updated_at: (r.updated_at as string | null) ?? null,
      vpn_username: order?.vpn_username ?? null,
      plan_name: order?.plan_name ?? null,
    };
  });

  return NextResponse.json({ success: true, tickets });
}

export async function PATCH(request: Request) {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

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

  const ticket_id =
    typeof body === "object" &&
    body !== null &&
    "ticket_id" in body &&
    typeof (body as { ticket_id: unknown }).ticket_id === "string"
      ? (body as { ticket_id: string }).ticket_id.trim()
      : "";

  const admin_reply =
    typeof body === "object" &&
    body !== null &&
    "admin_reply" in body &&
    typeof (body as { admin_reply: unknown }).admin_reply === "string"
      ? (body as { admin_reply: string }).admin_reply.trim()
      : "";

  const status =
    typeof body === "object" &&
    body !== null &&
    "status" in body &&
    typeof (body as { status: unknown }).status === "string"
      ? (body as { status: string }).status
      : "resolved";

  if (!ticket_id) {
    return jsonError("Invalid or missing ticket_id", 400);
  }

  if (!admin_reply || admin_reply.length < 3) {
    return jsonError("admin_reply is required", 400);
  }

  const { data: ticket, error } = await db.client
    .from("tickets")
    .update({
      admin_reply,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticket_id)
    .select("*")
    .single();

  if (error || !ticket) {
    return jsonError(error?.message ?? "Failed to update ticket", 500);
  }

  return NextResponse.json({ success: true, ticket });
}
