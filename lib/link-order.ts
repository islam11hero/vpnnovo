import "server-only";

import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import { isValidUuid } from "@/lib/uuid";

export type LinkOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string; status: number };

/** Attach a paid order to the authenticated Supabase user. */
export async function linkPaidOrderToUser(
  orderId: string,
  userId: string,
): Promise<LinkOrderResult> {
  if (!isValidUuid(orderId)) {
    return { ok: false, error: "Invalid Order ID", status: 400 };
  }

  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return { ok: false, error: db.error, status: 503 };
  }

  const { data: order, error: fetchError } = await db.client
    .from("orders")
    .select("id, status, user_id")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError || !order) {
    return { ok: false, error: "Order not found", status: 404 };
  }

  if (order.status !== "paid") {
    return { ok: false, error: "Order is not paid yet", status: 400 };
  }

  if (order.user_id && order.user_id !== userId) {
    return { ok: false, error: "Order already linked to another account", status: 409 };
  }

  if (order.user_id === userId) {
    return { ok: true, orderId };
  }

  const { error: updateError } = await db.client
    .from("orders")
    .update({ user_id: userId })
    .eq("id", orderId);

  if (updateError) {
    return { ok: false, error: "Could not link order", status: 500 };
  }

  return { ok: true, orderId };
}
