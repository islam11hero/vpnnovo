import "server-only";

import { orderUsernameOrFilter } from "@/lib/postgrest-filter";
import { resolveMarzbanUsername } from "@/lib/orders";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";

export type CachedTelemetry = {
  usedTraffic: number;
  dataLimit: number;
  marzbanStatus: string;
};

const ORDER_TELEMETRY_SELECT =
  "id, plan_name, status, vpn_username, marzban_username, user_id, created_at, used_traffic, data_limit, marzban_status, vpn_sub_link, wallet_balance_usd, payment_provider, stripe_session_id, amount";

export function readCachedTelemetry(
  order: Pick<
    SupabaseOrder,
    "used_traffic" | "data_limit" | "marzban_status"
  >,
): CachedTelemetry {
  return {
    usedTraffic: Number(order.used_traffic) || 0,
    dataLimit: Number(order.data_limit) || 0,
    marzbanStatus: order.marzban_status?.trim() || "unknown",
  };
}

/** Persist live Marzban stats onto the matching orders row. */
export async function syncOrderTelemetryCache(
  username: string,
  telemetry: CachedTelemetry,
): Promise<void> {
  const db = getSupabaseAdminResult();
  if (!db.ok) return;

  const trimmed = username.trim();
  if (!trimmed) return;

  const { error } = await db.client
    .from("orders")
    .update({
      used_traffic: telemetry.usedTraffic,
      data_limit: telemetry.dataLimit,
      marzban_status: telemetry.marzbanStatus,
    })
    .or(orderUsernameOrFilter(trimmed));

  if (error) {
    console.warn("[telemetry-cache] sync failed:", trimmed, error.message);
  }
}

export async function loadPaidOrdersWithCache(): Promise<{
  ok: boolean;
  orders: SupabaseOrder[];
  error?: string;
}> {
  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return { ok: false, orders: [], error: db.error };
  }

  const { data, error } = await db.client
    .from("orders")
    .select(ORDER_TELEMETRY_SELECT)
    .in("status", ["paid", "revoked"])
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, orders: [], error: error.message };
  }

  return { ok: true, orders: (data ?? []) as SupabaseOrder[] };
}

export async function loadPendingOrdersSummary(): Promise<{
  ok: boolean;
  pending: number;
  underpaid: number;
  failed: number;
  error?: string;
}> {
  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return { ok: false, pending: 0, underpaid: 0, failed: 0, error: db.error };
  }

  const { data, error } = await db.client
    .from("orders")
    .select("status")
    .in("status", ["pending", "underpaid", "failed"]);

  if (error) {
    return {
      ok: false,
      pending: 0,
      underpaid: 0,
      failed: 0,
      error: error.message,
    };
  }

  const rows = data ?? [];
  return {
    ok: true,
    pending: rows.filter((r) => r.status === "pending").length,
    underpaid: rows.filter((r) => r.status === "underpaid").length,
    failed: rows.filter((r) => r.status === "failed").length,
  };
}

export async function loadUserPaidOrderWithCache(
  userId: string,
): Promise<SupabaseOrder | null> {
  const db = getSupabaseAdminResult();
  if (!db.ok) return null;

  const { data, error } = await db.client
    .from("orders")
    .select(ORDER_TELEMETRY_SELECT)
    .eq("user_id", userId)
    .eq("status", "paid")
    .neq("plan_name", "Wallet Top-Up")
    .not("plan_name", "like", "Proxy ·%")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data?.length) return null;

  const orders = data as SupabaseOrder[];
  return (
    orders.find((order) => Boolean(resolveMarzbanUsername(order))) ?? null
  );
}

export function orderToCachedUsername(
  order: Pick<SupabaseOrder, "vpn_username" | "marzban_username">,
): string | null {
  return resolveMarzbanUsername(order);
}
