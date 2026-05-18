import "server-only";

import { getMarzbanAdminToken } from "@/lib/marzban";
import { marzbanFetch } from "@/lib/marzban-http";
import { normalizeMarzbanUsers } from "@/lib/marzban-users";

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
};

function parseUser(raw: Record<string, unknown>): MarzbanUserRecord {
  const proxies =
    raw.proxies && typeof raw.proxies === "object"
      ? (raw.proxies as Record<string, unknown>)
      : {};

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

export async function fetchAllMarzbanUsers(): Promise<
  | { ok: true; users: MarzbanUserRecord[]; byUsername: Map<string, MarzbanUserRecord> }
  | { ok: false; error: string }
> {
  try {
    const { token } = await getMarzbanAdminToken();
    const res = await marzbanFetch("/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text.slice(0, 200) || `HTTP ${res.status}` };
    }

    const payload = await res.json();
    const normalized = normalizeMarzbanUsers(payload);
    const users = normalized.map((u) =>
      parseUser(u as unknown as Record<string, unknown>),
    );
    const byUsername = new Map(users.map((u) => [u.username, u]));
    return { ok: true, users, byUsername };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Marzban users fetch failed";
    return { ok: false, error: message };
  }
}

export function sumMarzbanUsedTraffic(users: MarzbanUserRecord[]): number {
  return users.reduce((s, u) => s + (u.used_traffic ?? 0), 0);
}

export function countActiveMarzbanSessions(users: MarzbanUserRecord[]): number {
  return users.filter((u) => Boolean(u.online_at)).length;
}
