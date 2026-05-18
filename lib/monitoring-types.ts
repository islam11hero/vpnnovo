export type MonitoringBlacklistStatus = "clean" | "listed";

export type MonitoringAsnType = "residential" | "datacenter";

export type MonitoringIpReputation = {
  serverIp: string;
  fraudScore: number;
  blacklistStatus: MonitoringBlacklistStatus;
  asnType: MonitoringAsnType;
  isp: string;
  asn: string;
  region: string;
  vultrOnline: boolean;
  vultrError?: string;
};

export type MonitoringResourcePoint = {
  time: string;
  cpu: number;
  ram: number;
};

export type MonitoringNetworkMetrics = {
  stripeRttMs: number;
  facebookRttMs: number;
  packetLossPercent: number;
  measured: boolean;
};

export type MonitoringBandwidthRow = {
  username: string;
  protocol: string;
  usedGb: number;
  usedBytes: number;
  status: string;
};

export type MonitoringAbuseAlert = {
  id: string;
  severity: "warn" | "critical";
  message: string;
  timestamp: string;
};

export type MonitoringPayload = {
  ipReputation: MonitoringIpReputation;
  resourceSeries: MonitoringResourcePoint[];
  network: MonitoringNetworkMetrics;
  topConsumers: MonitoringBandwidthRow[];
  abuseAlerts: MonitoringAbuseAlert[];
  marzbanOnline: boolean;
  marzbanError?: string;
  fetchedAt: string;
};
