import "server-only";

import type { ClientCommandRow, MarzbanUserRecord } from "@/lib/marzban/users-bulk";
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
import { resolvePortalUrl } from "@/lib/vip-handoff";
import type { SupabaseOrder } from "@/lib/supabase/types";

function resolveRowSubLink(
  order: SupabaseOrder | undefined,
  user: Pick<MarzbanUserRecord, "subscription_url" | "links">,
): string {
  const fromOrder = order?.vpn_sub_link?.trim();
  if (fromOrder) return fromOrder;
  const fromMarzban = user.subscription_url?.trim();
  if (fromMarzban) return fromMarzban;
  return user.links[0]?.trim() ?? "";
}

function handoffFields(
  order: SupabaseOrder | undefined,
  user: Pick<MarzbanUserRecord, "subscription_url" | "links">,
) {
  const orderId = order?.id;
  return {
    orderId,
    portalLink: orderId ? resolvePortalUrl(orderId) : undefined,
    vpnSubLink: resolveRowSubLink(order, user) || null,
  };
}

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
      ...handoffFields(order, user),
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
      ...handoffFields(order, user),
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
      ...handoffFields(order, cachedRowToMarzbanUser(username, cache)),
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
