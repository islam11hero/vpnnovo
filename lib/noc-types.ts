/** Live NOC types — no mock payloads. */

export type ApiWidgetStatus = {
  online: boolean;
  configured?: boolean;
  error?: string;
};

export type NocFinancialMetrics = {
  mrr: number;
  vultrPendingCharges: number;
  netProfit: number;
  totalPaidRevenue: number;
  paidOrderCount: number;
  supabase: ApiWidgetStatus;
  vultr: ApiWidgetStatus;
};

export type NocBandwidthMetrics = {
  marzbanUsedBytes: number;
  vultrAllowedGb: number;
  burnPercent: number;
  marzban: ApiWidgetStatus;
  vultr: ApiWidgetStatus;
};

export type NocGrowthPoint = {
  name: string;
  revenue: number;
  trafficTb: number;
};

export type VultrFleetInstance = {
  id: string;
  label: string;
  os: string;
  vcpuCount: number;
  ramMb: number;
  mainIp: string;
  region: string;
  status: string;
  allowedBandwidthGb: number;
  powerStatus: string;
};

export type NocFleetMetrics = {
  instance: VultrFleetInstance | null;
  vultr: ApiWidgetStatus;
};

export type NocHealthMetrics = {
  activeConnections: number;
  marzbanUserCount: number;
  marzbanOnline: boolean;
  vultrPowerStatus: string;
  vultrServerStatus: string;
  marzban: ApiWidgetStatus;
  vultr: ApiWidgetStatus;
};

export type NocOverviewPayload = {
  financial: NocFinancialMetrics;
  bandwidth: NocBandwidthMetrics;
  fleet: NocFleetMetrics;
  health: NocHealthMetrics;
  chart: NocGrowthPoint[];
};
