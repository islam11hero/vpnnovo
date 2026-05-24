export type MarzbanUser = {
  username: string;
  status: string;
  used_traffic?: number;
  data_limit?: number;
  expire?: number | null;
  note?: string | null;
  created_at?: string | null;
};

export function normalizeMarzbanUsers(payload: unknown): MarzbanUser[] {
  if (Array.isArray(payload)) {
    return payload as MarzbanUser[];
  }
  if (
    payload &&
    typeof payload === "object" &&
    "users" in payload &&
    Array.isArray((payload as { users: unknown }).users)
  ) {
    return (payload as { users: MarzbanUser[] }).users;
  }
  return [];
}

import { formatBytes } from "@/lib/formatters";

/** @deprecated Use `formatBytes` from `@/lib/formatters`. */
export function formatTraffic(bytes: number): string {
  return formatBytes(bytes);
}

export function trafficToGb(bytes: number): number {
  return bytes / 1073741824;
}

/** Top users by traffic for the overview chart (real Marzban data). */
export function buildUsageChartData(users: MarzbanUser[]) {
  return [...users]
    .sort((a, b) => (b.used_traffic ?? 0) - (a.used_traffic ?? 0))
    .slice(0, 7)
    .map((u) => ({
      name:
        u.username.length > 10
          ? `${u.username.slice(0, 10)}…`
          : u.username,
      usage: Number(trafficToGb(u.used_traffic ?? 0).toFixed(2)),
    }));
}

export function isActiveStatus(status: string): boolean {
  return status.toLowerCase() === "active";
}
