import "server-only";

import { getMarzbanApiUrl, marzbanFetchJson } from "@/lib/marzban-client";
import { extractMarzbanSubscriptionLink } from "@/lib/marzban";
import type { ClientMarzbanTelemetry } from "@/lib/marzban-types";
import { syncOrderTelemetryCache } from "@/lib/orders-telemetry-cache";

function normalizeLinks(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => String(entry)).filter(Boolean);
}

function normalizeProxies(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

export type LiveTelemetryResult = {
  telemetry: ClientMarzbanTelemetry | null;
  live: boolean;
  error?: string;
};

/**
 * Live Marzban user telemetry — never throws; syncs Supabase cache on success.
 */
export async function fetchLiveMarzbanTelemetry(
  username: string,
): Promise<LiveTelemetryResult> {
  const trimmed = username.trim();
  if (!trimmed) {
    return { telemetry: null, live: false, error: "Missing username" };
  }

  const res = await marzbanFetchJson<{
    username?: string;
    used_traffic?: number;
    data_limit?: number;
    expire?: number | null;
    status?: string;
    subscription_url?: string;
    links?: unknown;
    proxies?: unknown;
  }>(`/api/user/${encodeURIComponent(trimmed)}`);

  if (!res.success) {
    console.error("[marzban-telemetry]", trimmed, res.error);
    return { telemetry: null, live: false, error: res.error };
  }

  const payload = res.data;

  let apiUrl: string;
  try {
    apiUrl = getMarzbanApiUrl();
  } catch {
    apiUrl = "";
  }

  const links = normalizeLinks(payload.links);
  const subscriptionUrl =
    (apiUrl &&
      extractMarzbanSubscriptionLink(apiUrl, {
        subscription_url: payload.subscription_url,
        links,
      })) ||
    null;

  const telemetry: ClientMarzbanTelemetry = {
    username: payload.username ?? trimmed,
    usedTraffic: Number(payload.used_traffic) || 0,
    dataLimit: Number(payload.data_limit) || 0,
    status: payload.status ?? "unknown",
    expireDate:
      payload.expire != null && payload.expire > 0
        ? Number(payload.expire)
        : null,
    subscriptionUrl,
    links,
    proxies: normalizeProxies(payload.proxies),
  };

  await syncOrderTelemetryCache(trimmed, {
    usedTraffic: telemetry.usedTraffic,
    dataLimit: telemetry.dataLimit,
    marzbanStatus: telemetry.status,
  });

  return { telemetry, live: true };
}
