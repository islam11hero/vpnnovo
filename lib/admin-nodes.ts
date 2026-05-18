import type { SupabaseOrderStatus } from "@/lib/supabase/types";

export type AdminNodeRow = {
  orderId: string;
  planName: string;
  orderStatus: SupabaseOrderStatus | "revoked";
  marzbanUsername: string | null;
  usedTraffic: number;
  dataLimit: number;
  marzbanStatus: string;
  expire: number | null;
  note: string | null;
  telemetryLive: boolean;
  createdAt: string;
  liveProtocol: string;
  sessionStatus: string;
  onlinesLimit: number | null;
  blockTorrent: boolean;
  blockAds: boolean;
};

export type AdminNodesPayload = {
  nodes: AdminNodeRow[];
  telemetryUnreachable: boolean;
};
