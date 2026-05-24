import "server-only";

import { extractAdsPowerProxy } from "@/lib/marzban-proxy-extract";
import type { AdsPowerProxyResult } from "@/lib/marzban-proxy-extract";
import { fetchLiveMarzbanTelemetry } from "@/lib/marzban-telemetry";
import type { ClientMarzbanTelemetry } from "@/lib/marzban-types";
import { loadPortalActiveOrders } from "@/lib/portal-orders";
import {
  loadUserPaidOrderWithCache,
  orderToCachedUsername,
  readCachedTelemetry,
} from "@/lib/orders-telemetry-cache";
import type { ProxyOrderRow } from "@/lib/supabase/proxy-types";
import type { SupabaseOrder } from "@/lib/supabase/types";
import { loadProxyOrdersForClient } from "@/lib/proxy-orders-loader";

export type ClientDashboardShell = {
  order: SupabaseOrder;
  marzbanUsername: string;
  subscriptionUrl: string | null;
};

export type ClientDashboardPayload = ClientDashboardShell & {
  telemetry: ClientMarzbanTelemetry | null;
  telemetryLive: boolean;
  telemetryDelayed: boolean;
  telemetryError?: string;
  adsPowerProxy: AdsPowerProxyResult;
  activeOrders: Awaited<ReturnType<typeof loadPortalActiveOrders>>;
  walletBalanceUsd: number;
  proxyOrders: ProxyOrderRow[];
  userId: string | null;
};

/** Fast path — Supabase only (for Suspense shell). */
export async function loadClientDashboardShell(
  userId: string,
): Promise<ClientDashboardShell | null> {
  const order = await loadUserPaidOrderWithCache(userId);
  if (!order) return null;

  const marzbanUsername = orderToCachedUsername(order) ?? "";
  const subscriptionUrl = order.vpn_sub_link?.trim() || null;

  return { order, marzbanUsername, subscriptionUrl };
}

function cachedTelemetryFromOrder(
  order: SupabaseOrder,
  username: string,
): ClientMarzbanTelemetry {
  const cache = readCachedTelemetry(order);
  return {
    username,
    usedTraffic: cache.usedTraffic,
    dataLimit: cache.dataLimit,
    status: cache.marzbanStatus,
    expireDate: null,
    subscriptionUrl: order.vpn_sub_link,
    links: [],
    proxies: {},
  };
}

/** Live Marzban merge — run inside Suspense. */
export async function loadClientDashboardTelemetry(
  shell: ClientDashboardShell,
): Promise<ClientDashboardPayload> {
  const { order, marzbanUsername } = shell;
  const activeOrders = await loadPortalActiveOrders(order.id);

  let telemetry: ClientMarzbanTelemetry | null = null;
  let telemetryLive = false;
  let telemetryDelayed = false;
  let telemetryError: string | undefined;

  if (marzbanUsername) {
    const live = await fetchLiveMarzbanTelemetry(marzbanUsername);
    if (live.live && live.telemetry) {
      telemetry = live.telemetry;
      telemetryLive = true;
    } else {
      telemetry = cachedTelemetryFromOrder(order, marzbanUsername);
      telemetryDelayed = true;
      telemetryError = live.error;
    }
  }

  const subscriptionUrl =
    telemetry?.subscriptionUrl ?? shell.subscriptionUrl ?? order.vpn_sub_link;

  const adsPowerProxy = extractAdsPowerProxy({
    links: telemetry?.links,
    subscriptionUrl,
    vpnUsername: marzbanUsername,
  });

  const userId = order.user_id?.trim() || null;
  const proxyOrders = await loadProxyOrdersForClient({
    userId,
    vaultOrderId: order.id,
  });

  return {
    order,
    marzbanUsername,
    subscriptionUrl,
    telemetry,
    telemetryLive,
    telemetryDelayed,
    telemetryError,
    adsPowerProxy,
    activeOrders,
    walletBalanceUsd: Number(order.wallet_balance_usd) || 0,
    proxyOrders,
    userId,
  };
}

/** Combined loader (legacy callers). */
export async function loadClientDashboard(
  userId: string,
): Promise<ClientDashboardPayload | null> {
  const shell = await loadClientDashboardShell(userId);
  if (!shell) return null;
  return loadClientDashboardTelemetry(shell);
}

/** Portal + admin callers — same telemetry merge as authenticated dashboard. */
export async function loadOrderDashboardPayload(
  order: SupabaseOrder,
): Promise<ClientDashboardPayload> {
  const shell: ClientDashboardShell = {
    order,
    marzbanUsername: orderToCachedUsername(order) ?? "",
    subscriptionUrl: order.vpn_sub_link?.trim() || null,
  };
  return loadClientDashboardTelemetry(shell);
}
