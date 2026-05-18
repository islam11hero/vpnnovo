import "server-only";

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
import type {
  NocBandwidthMetrics,
  NocFinancialMetrics,
  NocFleetMetrics,
  NocGrowthPoint,
  NocHealthMetrics,
} from "@/lib/noc-types";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";

const MARZBAN_LOAD_TIMEOUT_MS = 8_000;

async function fetchMarzbanUsersWithTimeout() {
  return Promise.race([
    fetchAllMarzbanUsers(),
    new Promise<{ ok: false; error: string }>((resolve) =>
      setTimeout(
        () => resolve({ ok: false, error: "Marzban request timed out" }),
        MARZBAN_LOAD_TIMEOUT_MS,
      ),
    ),
  ]);
}

async function loadPaidOrders() {
  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return {
      supabaseOnline: false,
      allPaid: [] as SupabaseOrder[],
      weekPaid: [] as SupabaseOrder[],
    };
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);

  let allPaid: SupabaseOrder[] = [];
  let weekPaid: SupabaseOrder[] = [];

  try {
    const { data, error } = await db.client
      .from("orders")
      .select("id, amount, plan_name, status, created_at")
      .eq("status", "paid");
    if (!error) allPaid = (data ?? []) as SupabaseOrder[];
    else console.error("[noc] paid orders", error.message);

    const { data: week, error: weekErr } = await db.client
      .from("orders")
      .select("amount, created_at, plan_name, status")
      .eq("status", "paid")
      .gte("created_at", since.toISOString());
    if (!weekErr) weekPaid = (week ?? []) as SupabaseOrder[];
    else console.error("[noc] week orders", weekErr.message);
  } catch (e) {
    console.error("[noc] orders", e);
  }

  return { supabaseOnline: true, allPaid, weekPaid };
}

export async function loadNocFinancialBlock(): Promise<{
  financial: NocFinancialMetrics;
  bandwidth: NocBandwidthMetrics;
}> {
  const orders = await loadPaidOrders();
  const vultrBilling = await loadVultrPendingCharges();
  const fleet = await loadFleetMetrics();
  const marzbanUsers = await fetchMarzbanUsersWithTimeout();
  const marzbanUsed = marzbanUsers.ok
    ? sumMarzbanUsedTraffic(marzbanUsers.users)
    : 0;

  const financial = buildFinancialMetrics(
    orders.allPaid,
    vultrBilling.pending,
    orders.supabaseOnline,
    vultrBilling.online,
    vultrBilling.error,
  );

  const bandwidth = buildBandwidthMetrics(
    marzbanUsed,
    fleet.instance?.allowedBandwidthGb ?? 0,
    marzbanUsers.ok,
    fleet.vultr.online,
    marzbanUsers.ok ? undefined : marzbanUsers.error,
    fleet.vultr.error,
  );

  return { financial, bandwidth };
}

export async function loadNocFleetBlock(): Promise<NocFleetMetrics> {
  return loadFleetMetrics();
}

export async function loadNocHealthBlock(): Promise<NocHealthMetrics> {
  const fleet = await loadFleetMetrics();
  const marzbanUsers = await fetchMarzbanUsersWithTimeout();
  let marzbanOnline = false;
  try {
    marzbanOnline = await checkMarzbanConnection();
  } catch (e) {
    console.error("[noc] marzban-ping", e);
  }

  return buildHealthMetrics({
    marzbanUserCount: marzbanUsers.ok ? marzbanUsers.users.length : 0,
    activeConnections: marzbanUsers.ok
      ? countActiveMarzbanSessions(marzbanUsers.users)
      : 0,
    marzbanOnline,
    vultrPowerStatus: fleet.instance?.powerStatus ?? "—",
    vultrServerStatus: fleet.instance?.status ?? "—",
    marzbanError: marzbanUsers.ok ? undefined : marzbanUsers.error,
    vultrError: fleet.vultr.error,
  });
}

export async function loadNocChartBlock(): Promise<NocGrowthPoint[]> {
  const orders = await loadPaidOrders();
  return buildGrowthChart(orders.weekPaid);
}

export async function loadNocClientsBlock() {
  const result = await loadAdminNodes();
  return {
    nodes: result.ok ? result.payload.nodes : [],
    telemetryUnreachable: result.ok
      ? result.payload.telemetryUnreachable
      : true,
  };
}
