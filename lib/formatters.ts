const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/** Raw Marzban bytes → human-readable size (e.g. 10737418240 → "10.00 GB"). */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0.00 B";

  const k = 1024;
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    BYTE_UNITS.length - 1,
  );
  const value = bytes / k ** i;
  return `${value.toFixed(2)} ${BYTE_UNITS[i]}`;
}

/** Marzban Unix expiry → readable date; `0` / `null` → "Unlimited". */
export function formatUnixDate(
  timestamp: number | null | undefined,
): string {
  if (timestamp == null || timestamp <= 0) return "Unlimited";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000));
}

/** Progress bar fill: `(used / limit) * 100`, capped at 100. */
export function usagePercent(used: number, limit: number): number {
  if (!Number.isFinite(limit) || limit <= 0) return 0;
  if (!Number.isFinite(used) || used <= 0) return 0;
  return Math.min(100, (used / limit) * 100);
}

export function formatMarzbanStatus(status: string | undefined): string {
  const s = status?.toLowerCase() ?? "";
  if (s === "disabled") return "Disabled";
  if (s === "limited") return "Limited";
  if (s === "active") return "Active";
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
}
