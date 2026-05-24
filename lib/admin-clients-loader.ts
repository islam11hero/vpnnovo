import "server-only";

import type { ClientCommandRow } from "@/lib/marzban/users-bulk";
import {
  cachedRowToMarzbanUser,
  fetchAllMarzbanUsers,
} from "@/lib/marzban/users-bulk";
import {
  loadPaidOrdersWithCache,
  loadPendingOrdersSummary,
  orderToCachedUsername,
  readCachedTelemetry,
} from "@/lib/orders-telemetry-cache";
import { resolveMarzbanUsername } from "@/lib/orders";
import type { SupabaseOrder } from "@/lib/supabase/types";

export type AdminClientsTelemetryPayload = {
  rows: ClientCommandRow[];
  marzbanOnline: boolean;
  telemetryDelayed: boolean;
  error?: string;
};

function buildCachedRows(orders: SupabaseOrder[]): ClientCommandRow[] {
  const seen = new Set<string>();
  const rows: ClientCommandRow[] = [];

  for (const order of orders) {
    const username = orderToCachedUsername(order);
    if (!username || seen.has(username)) continue;
    seen.add(username);

    const cache = readCachedTelemetry(order);
    const user = cachedRowToMarzbanUser(username, cache);

    rows.push({
      ...user,
      orderId: order.id,
      telemetryLive: false,
      telemetryDelayed: true,
    });
  }

  return rows.sort((a, b) => a.username.localeCompare(b.username));
}

function mergeLiveWithCache(
  orders: SupabaseOrder[],
  live: Awaited<ReturnType<typeof fetchAllMarzbanUsers>>,
): AdminClientsTelemetryPayload {
  if (!live.ok) {
    return {
      rows: buildCachedRows(orders),
      marzbanOnline: false,
      telemetryDelayed: true,
      error: live.error,
    };
  }

  const orderByUsername = new Map<string, SupabaseOrder>();
  for (const order of orders) {
    const name = resolveMarzbanUsername(order);
    if (name) orderByUsername.set(name, order);
  }

  const seen = new Set<string>();
  const rows: ClientCommandRow[] = live.users.map((user) => {
    seen.add(user.username);
    const order = orderByUsername.get(user.username);
    return {
      ...user,
      orderId: order?.id,
      telemetryLive: true,
      telemetryDelayed: false,
    };
  });

  for (const order of orders) {
    const username = resolveMarzbanUsername(order);
    if (!username || seen.has(username)) continue;
    seen.add(username);
    const cache = readCachedTelemetry(order);
    rows.push({
      ...cachedRowToMarzbanUser(username, cache),
      orderId: order.id,
      telemetryLive: false,
      telemetryDelayed: true,
    });
  }

  return {
    rows: rows.sort((a, b) => a.username.localeCompare(b.username)),
    marzbanOnline: true,
    telemetryDelayed: false,
  };
}

/** Fast Supabase shell — no Marzban blocking. */
export async function loadAdminClientsShell() {
  return loadPaidOrdersWithCache();
}

export async function loadPendingOrdersForAdmin() {
  return loadPendingOrdersSummary();
}

/** Live telemetry — safe to run inside Suspense. */
export async function loadAdminClientsTelemetry(): Promise<AdminClientsTelemetryPayload> {
  const [ordersResult, marzbanResult] = await Promise.all([
    loadPaidOrdersWithCache(),
    fetchAllMarzbanUsers(),
  ]);

  const orders = ordersResult.ok ? ordersResult.orders : [];

  if (!ordersResult.ok && !marzbanResult.ok) {
    return {
      rows: [],
      marzbanOnline: false,
      telemetryDelayed: true,
      error: ordersResult.error ?? marzbanResult.error,
    };
  }

  return mergeLiveWithCache(orders, marzbanResult);
}
