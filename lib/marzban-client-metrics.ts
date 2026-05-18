import type { MarzbanUserRecord } from "@/lib/marzban/users-bulk";

const SEVEN_DAYS_SEC = 7 * 24 * 60 * 60;

export type ClientGridMetrics = {
  totalProvisioned: number;
  expiringSoon: number;
  suspended: number;
};

export type ClientShieldStatus = "active" | "disabled" | "limited" | "expired";

export function computeClientGridMetrics(
  users: MarzbanUserRecord[],
): ClientGridMetrics {
  const nowSec = Math.floor(Date.now() / 1000);

  let expiringSoon = 0;
  let suspended = 0;

  for (const user of users) {
    if (user.status.toLowerCase() === "disabled") {
      suspended += 1;
    }
    if (
      user.expire != null &&
      user.expire > 0 &&
      user.expire > nowSec &&
      user.expire <= nowSec + SEVEN_DAYS_SEC
    ) {
      expiringSoon += 1;
    }
  }

  return {
    totalProvisioned: users.length,
    expiringSoon,
    suspended,
  };
}

export function resolveClientShieldStatus(
  user: MarzbanUserRecord,
): ClientShieldStatus {
  const nowSec = Math.floor(Date.now() / 1000);
  if (user.expire != null && user.expire > 0 && user.expire < nowSec) {
    return "expired";
  }
  const s = user.status.toLowerCase();
  if (s === "disabled") return "disabled";
  if (s === "limited") return "limited";
  return "active";
}

export function formatExpiryLabel(expire: number | null): string {
  if (expire == null || expire <= 0) return "Never";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(expire * 1000));
}

export function bandwidthPercent(used: number, limit: number): number {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, (used / limit) * 100);
}
