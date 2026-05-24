/** Shared Marzban types — safe for Client Components (no server imports). */

/** Legacy stats shape — prefer `ClientMarzbanTelemetry` for dashboards. */
export type MarzbanUserStats = {
  used_traffic: number;
  data_limit: number;
  expire: number | null;
  status?: string;
};

/** Live telemetry passed from RSC → client dashboards. */
export type ClientMarzbanTelemetry = {
  username: string;
  usedTraffic: number;
  dataLimit: number;
  status: string;
  expireDate: number | null;
  subscriptionUrl: string | null;
  links: string[];
  proxies: Record<string, unknown>;
};

export function telemetryToLegacyStats(
  telemetry: ClientMarzbanTelemetry | null,
): MarzbanUserStats | null {
  if (!telemetry) return null;
  return {
    used_traffic: telemetry.usedTraffic,
    data_limit: telemetry.dataLimit,
    expire: telemetry.expireDate,
    status: telemetry.status,
  };
}
