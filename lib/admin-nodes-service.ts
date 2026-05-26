import "server-only";

import type { AdminNodeRow, AdminNodesPayload } from "@/lib/admin-nodes";
import { routingFlagsFromNote } from "@/lib/marzban-routing-note";
import {
  fetchAllMarzbanUsers,
  fetchMarzbanUserByUsername,
  protocolLabelFromProxies,
  sessionStatusLabel,
  type MarzbanUserRecord,
} from "@/lib/marzban/users-bulk";
import { resolveMarzbanUsername } from "@/lib/orders";
import { readCachedTelemetry } from "@/lib/orders-telemetry-cache";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";

const ORDER_SELECT =
  "id, plan_name, status, vpn_username, marzban_username, user_id, created_at, used_traffic, data_limit, marzban_status";

function mergeMarzbanRow(
  order: SupabaseOrder,
  marzban: MarzbanUserRecord | undefined,
  telemetryLive: boolean,
): AdminNodeRow {
  const marzbanUsername = resolveMarzbanUsername(order);
  const flags = routingFlagsFromNote(marzban?.note ?? null);

  if (!marzban) {
    const cache = readCachedTelemetry(order);
    const hasCache =
      cache.usedTraffic > 0 ||
      cache.dataLimit > 0 ||
      (cache.marzbanStatus && cache.marzbanStatus !== "unknown");

    return {
      orderId: order.id,
      planName: order.plan_name,
      orderStatus: order.status,
      marzbanUsername,
      usedTraffic: hasCache ? cache.usedTraffic : 0,
      dataLimit: hasCache ? cache.dataLimit : 0,
      marzbanStatus: order.status === "revoked" ? "revoked" : cache.marzbanStatus,
      expire: null,
      note: null,
      telemetryLive: false,
      createdAt: order.created_at,
      liveProtocol: marzbanUsername ? "VLESS" : "—",
      sessionStatus: order.status === "revoked"
        ? "Revoked"
        : hasCache
          ? sessionStatusLabel(cache.marzbanStatus, null)
          : marzbanUsername
            ? "Sync pending"
            : "No Marzban user",
      onlinesLimit: null,
      blockTorrent: flags.blockTorrent,
      blockAds: flags.blockAds,
    };
  }

  return {
    orderId: order.id,
    planName: order.plan_name,
    orderStatus: order.status,
    marzbanUsername,
    usedTraffic: marzban.used_traffic,
    dataLimit: marzban.data_limit,
    marzbanStatus: marzban.status,
    expire: marzban.expire,
    note: marzban.note,
    telemetryLive,
    createdAt: order.created_at,
    liveProtocol: protocolLabelFromProxies(marzban.proxies),
    sessionStatus: sessionStatusLabel(marzban.status, marzban.online_at),
    onlinesLimit: marzban.onlines_limit,
    blockTorrent: flags.blockTorrent,
    blockAds: flags.blockAds,
  };
}

export async function loadAdminNodes(): Promise<
  | { ok: true; payload: AdminNodesPayload }
  | { ok: false; error: string }
> {
  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return { ok: false, error: db.error };
  }

  const { data: orders, error } = await db.client
    .from("orders")
    .select(ORDER_SELECT)
    .in("status", ["paid", "revoked"])
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: error.message };
  }

  const rows = (orders ?? []) as SupabaseOrder[];
  const marzbanResult = await fetchAllMarzbanUsers();
  const byUsername = marzbanResult.ok ? marzbanResult.byUsername : new Map();
  const telemetryUnreachable = !marzbanResult.ok;

  const nodes: AdminNodeRow[] = await Promise.all(
    rows.map(async (order) => {
      const username = resolveMarzbanUsername(order);
      let marzban =
        username && order.status !== "revoked"
          ? byUsername.get(username)
          : undefined;
      let telemetryLive = Boolean(marzban && marzbanResult.ok);

      if (!marzban && username && order.status !== "revoked") {
        const live = await fetchMarzbanUserByUsername(username);
        if (live.ok) {
          marzban = live.user;
          telemetryLive = true;
        }
      }

      return mergeMarzbanRow(order, marzban, telemetryLive);
    }),
  );

  return {
    ok: true,
    payload: {
      nodes,
      telemetryUnreachable,
    },
  };
}
