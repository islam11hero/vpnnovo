import "server-only";

import type { AdminNodeRow, AdminNodesPayload } from "@/lib/admin-nodes";
import {
  fetchAllMarzbanUsers,
  protocolLabelFromProxies,
  sessionStatusLabel,
  type MarzbanUserRecord,
} from "@/lib/marzban/users-bulk";
import { resolveMarzbanUsername } from "@/lib/orders";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";

const ORDER_SELECT =
  "id, plan_name, status, vpn_username, marzban_username, user_id, created_at";

function routingFlagsFromNote(note: string | null): {
  blockTorrent: boolean;
  blockAds: boolean;
} {
  const n = (note ?? "").toLowerCase();
  return {
    blockTorrent: n.includes("block_torrent") || n.includes("no_p2p"),
    blockAds: n.includes("block_ads") || n.includes("no_ads"),
  };
}

function mergeMarzbanRow(
  order: SupabaseOrder,
  marzban: MarzbanUserRecord | undefined,
  telemetryLive: boolean,
): AdminNodeRow {
  const marzbanUsername = resolveMarzbanUsername(order);
  const flags = routingFlagsFromNote(marzban?.note ?? null);

  if (!marzban) {
    return {
      orderId: order.id,
      planName: order.plan_name,
      orderStatus: order.status,
      marzbanUsername,
      usedTraffic: 0,
      dataLimit: 0,
      marzbanStatus: order.status === "revoked" ? "revoked" : "unknown",
      expire: null,
      note: null,
      telemetryLive: false,
      createdAt: order.created_at,
      liveProtocol: "—",
      sessionStatus: order.status === "revoked" ? "Revoked" : "No Telemetry",
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

  const nodes: AdminNodeRow[] = rows.map((order) => {
    const username = resolveMarzbanUsername(order);
    const marzban =
      username && order.status !== "revoked"
        ? byUsername.get(username)
        : undefined;
    return mergeMarzbanRow(
      order,
      marzban,
      Boolean(marzban && marzbanResult.ok),
    );
  });

  return {
    ok: true,
    payload: {
      nodes,
      telemetryUnreachable,
    },
  };
}
