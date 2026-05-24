"use server";

import { revalidatePath } from "next/cache";

import { actionErr, actionOk, type ActionResult } from "@/lib/actions-result";
import { assertOrderAccess } from "@/lib/order-access";
import { isAdminAuthenticated } from "@/lib/require-admin";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import { ACTIVE_NODE_STATUSES } from "@/lib/orders";
import type { SupportTicket, SupportTicketWithOrder } from "@/lib/tickets";
import { isValidUuid } from "@/lib/uuid";

function getDb() {
  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return { ok: false as const, error: db.error };
  }
  return { ok: true as const, client: db.client };
}

export async function createSupportTicket(input: {
  order_id: string;
  subject: string;
  message: string;
}): Promise<ActionResult<{ ticket: SupportTicket }>> {
  const order_id = input.order_id?.trim() ?? "";
  const subject = input.subject?.trim() ?? "";
  const message = input.message?.trim() ?? "";

  if (!isValidUuid(order_id)) {
    return actionErr("Select a valid VPN node before submitting.");
  }

  if (!subject || subject.length > 200) {
    return actionErr("Invalid or missing subject.");
  }

  if (!message || message.length < 10 || message.length > 5000) {
    return actionErr("Message must be between 10 and 5000 characters.");
  }

  const db = getDb();
  if (!db.ok) return actionErr(db.error);

  const access = await assertOrderAccess(order_id);
  if (!access.ok) return actionErr(access.error);

  const { data: order } = await db.client
    .from("orders")
    .select("id, status")
    .eq("id", order_id)
    .maybeSingle();

  if (!order) {
    return actionErr("VPN node not found.");
  }

  if (!ACTIVE_NODE_STATUSES.includes(order.status as (typeof ACTIVE_NODE_STATUSES)[number])) {
    return actionErr("Only active paid nodes can open support tickets.");
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
    return actionErr(error?.message ?? "Failed to create ticket.");
  }

  revalidatePath(`/portal/${order_id}`);
  return actionOk({ ticket: ticket as SupportTicket });
}

export async function getTicketsForOrder(
  order_id: string,
): Promise<ActionResult<{ tickets: SupportTicket[] }>> {
  if (!isValidUuid(order_id)) {
    return actionErr("Invalid order_id.");
  }

  const db = getDb();
  if (!db.ok) return actionErr(db.error);

  const access = await assertOrderAccess(order_id);
  if (!access.ok) return actionErr(access.error);

  const { data: order } = await db.client
    .from("orders")
    .select("id")
    .eq("id", order_id)
    .maybeSingle();

  if (!order) {
    return actionErr("Order not found.");
  }

  const { data: tickets, error } = await db.client
    .from("tickets")
    .select("*")
    .eq("order_id", order_id)
    .order("created_at", { ascending: false });

  if (error) {
    return actionErr(error.message);
  }

  return actionOk({ tickets: (tickets ?? []) as SupportTicket[] });
}

type OrderJoin = {
  vpn_username: string | null;
  marzban_username?: string | null;
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

export async function getAllSupportTickets(): Promise<
  ActionResult<{ tickets: SupportTicketWithOrder[] }>
> {
  if (!isAdminAuthenticated()) {
    return actionErr("Unauthorized");
  }

  const db = getDb();
  if (!db.ok) return actionErr(db.error);

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
        marzban_username,
        plan_name
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return actionErr(error.message);
  }

  const tickets: SupportTicketWithOrder[] = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const order = parseOrderJoin(r.orders);
    const vpn_username =
      order?.marzban_username?.trim() || order?.vpn_username?.trim() || null;
    return {
      id: String(r.id),
      order_id: String(r.order_id),
      subject: String(r.subject),
      message: String(r.message),
      status: String(r.status) as SupportTicketWithOrder["status"],
      admin_reply: (r.admin_reply as string | null) ?? null,
      created_at: String(r.created_at),
      updated_at: (r.updated_at as string | null) ?? null,
      vpn_username,
      plan_name: order?.plan_name ?? null,
    };
  });

  return actionOk({ tickets });
}

export async function replyToSupportTicket(input: {
  ticket_id: string;
  admin_reply: string;
}): Promise<ActionResult<{ ticket: SupportTicket }>> {
  if (!isAdminAuthenticated()) {
    return actionErr("Unauthorized");
  }

  const ticket_id = input.ticket_id?.trim() ?? "";
  const admin_reply = input.admin_reply?.trim() ?? "";

  if (!ticket_id) {
    return actionErr("Invalid ticket.");
  }

  if (!admin_reply || admin_reply.length < 3) {
    return actionErr("Reply must be at least 3 characters.");
  }

  const db = getDb();
  if (!db.ok) return actionErr(db.error);

  const { data: ticket, error } = await db.client
    .from("tickets")
    .update({
      admin_reply,
      status: "closed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", ticket_id)
    .select("*")
    .single();

  if (error || !ticket) {
    return actionErr(error?.message ?? "Failed to update ticket.");
  }

  revalidatePath("/admin");
  return actionOk({ ticket: ticket as SupportTicket });
}
