import type {
  NocBandwidthMetrics,
  NocFinancialMetrics,
  NocFleetMetrics,
  NocGrowthPoint,
  NocHealthMetrics,
} from "@/lib/noc-types";

export const EMPTY_FINANCIAL: NocFinancialMetrics = {
  mrr: 0,
  vultrPendingCharges: 0,
  netProfit: 0,
  totalPaidRevenue: 0,
  paidOrderCount: 0,
  supabase: { online: false, error: "Unavailable" },
  vultr: { online: false, error: "Unavailable" },
};

export const EMPTY_BANDWIDTH: NocBandwidthMetrics = {
  marzbanUsedBytes: 0,
  vultrAllowedGb: 0,
  burnPercent: 0,
  marzban: { online: false, error: "Unavailable" },
  vultr: { online: false, error: "Unavailable" },
};

export const EMPTY_FLEET: NocFleetMetrics = {
  instance: null,
  vultr: { online: false, error: "Unavailable" },
};

export const EMPTY_HEALTH: NocHealthMetrics = {
  activeConnections: 0,
  marzbanUserCount: 0,
  marzbanOnline: false,
  vultrPowerStatus: "—",
  vultrServerStatus: "—",
  marzban: { online: false, error: "Unavailable" },
  vultr: { online: false, error: "Unavailable" },
};

export function emptyGrowthChart(): NocGrowthPoint[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((name) => ({ name, revenue: 0, trafficTb: 0 }));
}
