import "server-only";

import type {
  NocBandwidthMetrics,
  NocFinancialMetrics,
  NocFleetMetrics,
  NocGrowthPoint,
  NocHealthMetrics,
  VultrFleetInstance,
} from "@/lib/noc-types";
import { planToExpireMonths } from "@/lib/marzban";
import { buildRevenueChartData } from "@/lib/revenue-chart";
import type { SupabaseOrder } from "@/lib/supabase/types";
import {
  fetchPrimaryVultrInstance,
  fetchVultrAccount,
  type VultrInstance,
} from "@/lib/vultr";

const TB = 1024 ** 4;

export function computeMrrFromPaidOrders(
  orders: Pick<SupabaseOrder, "amount" | "plan_name" | "created_at">[],
): number {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  let mrr = 0;

  for (const order of orders) {
    const created = new Date(order.created_at).getTime();
    if (created < thirtyDaysAgo) continue;
    const months = Math.max(1, planToExpireMonths(order.plan_name));
    mrr += Number(order.amount) / months;
  }

  return Number(mrr.toFixed(2));
}

export function buildFinancialMetrics(
  paidOrders: SupabaseOrder[],
  vultrPending: number,
  supabaseOnline: boolean,
  vultrOnline: boolean,
  vultrError?: string,
): NocFinancialMetrics {
  const mrr = computeMrrFromPaidOrders(paidOrders);
  const totalPaidRevenue = paidOrders.reduce(
    (s, o) => s + Number(o.amount),
    0,
  );
  const pending = vultrOnline ? vultrPending : 0;
  const netProfit = Number((mrr - pending).toFixed(2));

  return {
    mrr,
    vultrPendingCharges: pending,
    netProfit,
    totalPaidRevenue: Number(totalPaidRevenue.toFixed(2)),
    paidOrderCount: paidOrders.length,
    supabase: { online: supabaseOnline },
    vultr: { online: vultrOnline, error: vultrError },
  };
}

export function buildBandwidthMetrics(
  marzbanUsedBytes: number,
  vultrAllowedGb: number,
  marzbanOnline: boolean,
  vultrOnline: boolean,
  marzbanError?: string,
  vultrError?: string,
): NocBandwidthMetrics {
  const allowedBytes = vultrAllowedGb > 0 ? vultrAllowedGb * 1024 ** 3 : 0;
  const burnPercent =
    allowedBytes > 0
      ? Math.min(100, Number(((marzbanUsedBytes / allowedBytes) * 100).toFixed(1)))
      : 0;

  return {
    marzbanUsedBytes: marzbanOnline ? marzbanUsedBytes : 0,
    vultrAllowedGb: vultrOnline ? vultrAllowedGb : 0,
    burnPercent: marzbanOnline && vultrOnline ? burnPercent : 0,
    marzban: { online: marzbanOnline, error: marzbanError },
    vultr: { online: vultrOnline, error: vultrError },
  };
}

export function mapVultrInstance(
  instance: VultrInstance | null,
): VultrFleetInstance | null {
  if (!instance) return null;
  return {
    id: instance.id,
    label: instance.label || "Fleet Node",
    os: instance.os || "—",
    vcpuCount: instance.vcpu_count ?? 0,
    ramMb: instance.ram ?? 0,
    mainIp: instance.main_ip || "—",
    region: instance.region || "—",
    status: instance.status || "unknown",
    allowedBandwidthGb: instance.allowed_bandwidth ?? 0,
    powerStatus: instance.power_status || "unknown",
  };
}

export async function loadFleetMetrics(): Promise<NocFleetMetrics> {
  const instanceRes = await fetchPrimaryVultrInstance();
  if (!instanceRes.ok) {
    return {
      instance: null,
      vultr: { online: false, error: instanceRes.error },
    };
  }
  return {
    instance: mapVultrInstance(instanceRes.data),
    vultr: { online: true },
  };
}

export async function loadVultrPendingCharges(): Promise<{
  pending: number;
  online: boolean;
  error?: string;
}> {
  const account = await fetchVultrAccount();
  if (!account.ok) {
    return { pending: 0, online: false, error: account.error };
  }
  return {
    pending: account.data.pending_charges,
    online: true,
  };
}

export function buildGrowthChart(
  paidOrders: Pick<SupabaseOrder, "amount" | "created_at">[],
): NocGrowthPoint[] {
  const revenuePoints = buildRevenueChartData(paidOrders);
  return revenuePoints.map((d) => ({
    name: d.name,
    revenue: d.revenue,
    trafficTb: 0,
  }));
}

export function buildHealthMetrics(input: {
  marzbanUserCount: number;
  activeConnections: number;
  marzbanOnline: boolean;
  vultrPowerStatus: string;
  vultrServerStatus: string;
  marzbanError?: string;
  vultrError?: string;
}): NocHealthMetrics {
  return {
    activeConnections: input.marzbanOnline ? input.activeConnections : 0,
    marzbanUserCount: input.marzbanOnline ? input.marzbanUserCount : 0,
    marzbanOnline: input.marzbanOnline,
    vultrPowerStatus: input.vultrPowerStatus || "—",
    vultrServerStatus: input.vultrServerStatus || "—",
    marzban: { online: input.marzbanOnline, error: input.marzbanError },
    vultr: {
      online: !input.vultrError,
      error: input.vultrError,
    },
  };
}

export function formatTb(bytes: number): number {
  if (!bytes || bytes <= 0) return 0;
  return Number((bytes / TB).toFixed(2));
}
