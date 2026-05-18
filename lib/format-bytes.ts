const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/** Format raw bytes as B / KB / MB / GB / TB with 2 decimal precision. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0.00 B";

  const k = 1024;
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    UNITS.length - 1,
  );
  const value = bytes / k ** i;
  return `${value.toFixed(2)} ${UNITS[i]}`;
}
