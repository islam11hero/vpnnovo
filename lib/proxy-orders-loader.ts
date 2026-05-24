import "server-only";

import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { ProxyOrderRow } from "@/lib/supabase/proxy-types";

export async function loadClientProxyOrders(
  userId: string,
): Promise<ProxyOrderRow[]> {
  const db = getSupabaseAdminResult();
  if (!db.ok || !userId.trim()) return [];

  const { data, error } = await db.client
    .from("proxy_orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.warn("[proxy-orders] client load failed:", error.message);
    return [];
  }

  return (data ?? []) as ProxyOrderRow[];
}

export async function loadProxyOrdersByVaultOrderId(
  vaultOrderId: string,
): Promise<ProxyOrderRow[]> {
  const db = getSupabaseAdminResult();
  if (!db.ok || !vaultOrderId.trim()) return [];

  const { data, error } = await db.client
    .from("proxy_orders")
    .select("*")
    .eq("vault_order_id", vaultOrderId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.warn("[proxy-orders] vault load failed:", error.message);
    return [];
  }

  return (data ?? []) as ProxyOrderRow[];
}

/** Portal + dashboard: orders tied to vault and/or Supabase user. */
export async function loadProxyOrdersForClient(ctx: {
  userId?: string | null;
  vaultOrderId: string;
}): Promise<ProxyOrderRow[]> {
  const vaultOrderId = ctx.vaultOrderId.trim();
  const userId = ctx.userId?.trim() ?? "";

  const [byVault, byUser] = await Promise.all([
    vaultOrderId ? loadProxyOrdersByVaultOrderId(vaultOrderId) : [],
    userId ? loadClientProxyOrders(userId) : [],
  ]);

  const seen = new Set<string>();
  const merged: ProxyOrderRow[] = [];
  for (const row of [...byVault, ...byUser]) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    merged.push(row);
  }
  merged.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  return merged.slice(0, 50);
}

export async function loadAdminProxyOrders(): Promise<{
  ok: boolean;
  orders: ProxyOrderRow[];
  error?: string;
}> {
  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return { ok: false, orders: [], error: db.error };
  }

  const { data, error } = await db.client
    .from("proxy_orders")
    .select("*")
    .in("status", ["paid", "processing", "delivered", "pending"])
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return { ok: false, orders: [], error: error.message };
  }

  return { ok: true, orders: (data ?? []) as ProxyOrderRow[] };
}

export async function findProxyOrderByPaymentId(
  paymentOrderId: string,
): Promise<ProxyOrderRow | null> {
  const db = getSupabaseAdminResult();
  if (!db.ok) return null;

  const { data, error } = await db.client
    .from("proxy_orders")
    .select("*")
    .eq("payment_order_id", paymentOrderId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProxyOrderRow;
}
