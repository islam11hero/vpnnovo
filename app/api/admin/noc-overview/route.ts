import { NextResponse } from "next/server";

import { loadAdminNodes } from "@/lib/admin-nodes-service";
import {
  countActiveMarzbanSessions,
  fetchAllMarzbanUsers,
  sumMarzbanUsedTraffic,
} from "@/lib/marzban/users-bulk";
import { checkMarzbanConnection } from "@/lib/marzban";
import {
  buildBandwidthMetrics,
  buildFinancialMetrics,
  buildGrowthChart,
  buildHealthMetrics,
  loadFleetMetrics,
  loadVultrPendingCharges,
} from "@/lib/noc-live-metrics";
import type { NocOverviewPayload } from "@/lib/noc-types";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ZERO_OVERVIEW: NocOverviewPayload = {
  financial: {
    mrr: 0,
    vultrPendingCharges: 0,
    netProfit: 0,
    totalPaidRevenue: 0,
    paidOrderCount: 0,
    supabase: { online: false, error: "Supabase offline" },
    vultr: { online: false },
  },
  bandwidth: {
    marzbanUsedBytes: 0,
    vultrAllowedGb: 0,
    burnPercent: 0,
    marzban: { online: false },
    vultr: { online: false },
  },
  fleet: { instance: null, vultr: { online: false } },
  health: {
    activeConnections: 0,
    marzbanUserCount: 0,
    marzbanOnline: false,
    vultrPowerStatus: "—",
    vultrServerStatus: "—",
    marzban: { online: false },
    vultr: { online: false },
  },
  chart: buildGrowthChart([]),
};

export async function GET() {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  const db = getSupabaseAdminResult();
  if (!db.ok) {
    console.error("[admin:noc-overview] supabase", db.error);
    return NextResponse.json({ success: true, ...ZERO_OVERVIEW });
  }

  let allPaidOrders: SupabaseOrder[] = [];
  let chartPaidOrders: SupabaseOrder[] = [];
  const since = new Date();
  since.setDate(since.getDate() - 7);

  try {
    const { data: allPaid, error: allErr } = await db.client
      .from("orders")
      .select("id, amount, plan_name, status, created_at")
      .eq("status", "paid");

    if (allErr) {
      console.error("[admin:noc-overview] orders", allErr.message);
    } else {
      allPaidOrders = (allPaid ?? []) as SupabaseOrder[];
    }

    const { data: weekPaid, error: weekErr } = await db.client
      .from("orders")
      .select("amount, created_at, plan_name, status")
      .eq("status", "paid")
      .gte("created_at", since.toISOString());

    if (weekErr) {
      console.error("[admin:noc-overview] chart", weekErr.message);
    } else {
      chartPaidOrders = (weekPaid ?? []) as SupabaseOrder[];
    }
  } catch (e) {
    console.error("[admin:noc-overview] orders", e);
  }

  const vultrBilling = await loadVultrPendingCharges();
  const fleet = await loadFleetMetrics();

  const financial = buildFinancialMetrics(
    allPaidOrders,
    vultrBilling.pending,
    true,
    vultrBilling.online,
    vultrBilling.error,
    vultrBilling.configured,
  );

  const marzbanUsers = await fetchAllMarzbanUsers();
  const marzbanUsed = marzbanUsers.ok
    ? sumMarzbanUsedTraffic(marzbanUsers.users)
    : 0;
  const vultrAllowedGb = fleet.instance?.allowedBandwidthGb ?? 0;

  const bandwidth = buildBandwidthMetrics(
    marzbanUsed,
    vultrAllowedGb,
    marzbanUsers.ok,
    fleet.vultr.online,
    marzbanUsers.ok ? undefined : marzbanUsers.error,
    fleet.vultr.error,
    fleet.vultr.configured !== false,
  );

  let marzbanOnline = false;
  try {
    marzbanOnline = await checkMarzbanConnection();
  } catch (e) {
    console.error("[admin:noc-overview] marzban-ping", e);
  }

  const activeConnections = marzbanUsers.ok
    ? countActiveMarzbanSessions(marzbanUsers.users)
    : 0;

  const health = buildHealthMetrics({
    marzbanUserCount: marzbanUsers.ok ? marzbanUsers.users.length : 0,
    activeConnections,
    marzbanOnline,
    vultrPowerStatus: fleet.instance?.powerStatus ?? "—",
    vultrServerStatus: fleet.instance?.status ?? "—",
    marzbanError: marzbanUsers.ok ? undefined : marzbanUsers.error,
    vultrError: fleet.vultr.error,
  });

  const nodesResult = await loadAdminNodes();
  const nodes = nodesResult.ok ? nodesResult.payload.nodes : [];

  const chart = buildGrowthChart(chartPaidOrders);

  return NextResponse.json({
    success: true,
    financial,
    bandwidth,
    fleet,
    health,
    chart,
    nodes,
    telemetryUnreachable: nodesResult.ok
      ? nodesResult.payload.telemetryUnreachable
      : true,
  });
}
