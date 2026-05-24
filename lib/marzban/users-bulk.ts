import "server-only";

import { marzbanFetchJson } from "@/lib/marzban-client";
import { normalizeMarzbanUsers } from "@/lib/marzban-users";
import {
  syncOrderTelemetryCache,
  type CachedTelemetry,
} from "@/lib/orders-telemetry-cache";

export type MarzbanUserRecord = {
  username: string;
  status: string;
  used_traffic: number;
  data_limit: number;
  expire: number | null;
  note: string | null;
  proxies: Record<string, unknown>;
  onlines_limit: number | null;
  online_at: string | null;
  subscription_url: string | null;
  links: string[];
};

export type ClientCommandRow = MarzbanUserRecord & {
  orderId?: string;
  portalLink?: string;
  vpnSubLink?: string | null;
  telemetryLive: boolean;
  telemetryDelayed: boolean;
};

function parseUser(raw: Record<string, unknown>): MarzbanUserRecord {
  const proxies =
    raw.proxies && typeof raw.proxies === "object"
      ? (raw.proxies as Record<string, unknown>)
      : {};

  const linksRaw = raw.links;
  const links = Array.isArray(linksRaw)
    ? linksRaw.map((l) => String(l)).filter(Boolean)
    : [];

  return {
    username: String(raw.username ?? ""),
    status: String(raw.status ?? "unknown"),
    used_traffic: Number(raw.used_traffic) || 0,
    data_limit: Number(raw.data_limit) || 0,
    expire: raw.expire != null ? Number(raw.expire) : null,
    note: raw.note != null ? String(raw.note) : null,
    proxies,
    onlines_limit:
      raw.onlines_limit != null ? Number(raw.onlines_limit) : null,
    online_at: raw.online_at != null ? String(raw.online_at) : null,
    subscription_url:
      raw.subscription_url != null ? String(raw.subscription_url) : null,
    links,
  };
}

function toCachedTelemetry(user: MarzbanUserRecord): CachedTelemetry {
  return {
    usedTraffic: user.used_traffic,
    dataLimit: user.data_limit,
    marzbanStatus: user.status,
  };
}

export function protocolLabelFromProxies(
  proxies: Record<string, unknown>,
): string {
  const keys = Object.keys(proxies);
  if (!keys.length) return "—";
  return keys.map((k) => k.toUpperCase()).join(" + ");
}

export function sessionStatusLabel(
  status: string,
  onlineAt: string | null,
): string {
  const s = status.toLowerCase();
  if (s === "disabled" || s === "limited") return "Disabled";
  if (onlineAt) return "Active Session";
  if (s === "active") return "Idle";
  return status || "Unknown";
}

/** Build a grid row from Supabase telemetry cache when Marzban is delayed. */
export function cachedRowToMarzbanUser(
  username: string,
  cache: CachedTelemetry,
): MarzbanUserRecord {
  return {
    username,
    status: cache.marzbanStatus,
    used_traffic: cache.usedTraffic,
    data_limit: cache.dataLimit,
    expire: null,
    note: null,
    proxies: {},
    onlines_limit: null,
    online_at: null,
    subscription_url: null,
    links: [],
  };
}

export function sumMarzbanUsedTraffic(users: MarzbanUserRecord[]): number {
  return users.reduce((sum, user) => sum + (user.used_traffic || 0), 0);
}

export function countActiveMarzbanSessions(users: MarzbanUserRecord[]): number {
  return users.filter(
    (user) =>
      Boolean(user.online_at) ||
      user.status.toLowerCase() === "active",
  ).length;
}

export async function fetchAllMarzbanUsers(): Promise<
  | { ok: true; users: MarzbanUserRecord[]; byUsername: Map<string, MarzbanUserRecord> }
  | { ok: false; error: string }
> {
  const res = await marzbanFetchJson<{ users?: unknown }>("/api/users");

  if (!res.success) {
    return { ok: false, error: res.error };
  }

  const normalized = normalizeMarzbanUsers(res.data);
  const users = normalized.map((raw) =>
    parseUser(raw as Record<string, unknown>),
  );

  const byUsername = new Map<string, MarzbanUserRecord>();
  for (const user of users) {
    if (!user.username) continue;
    byUsername.set(user.username, user);
    await syncOrderTelemetryCache(user.username, toCachedTelemetry(user));
  }

  return { ok: true, users, byUsername };
}
