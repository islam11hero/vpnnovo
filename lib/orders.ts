import type { SupabaseOrder, SupabaseOrderStatus } from "@/lib/supabase/types";

/** Marzban panel username — supports legacy `vpn_username` column. */
export function resolveMarzbanUsername(
  order: Pick<SupabaseOrder, "vpn_username" | "marzban_username">,
): string | null {
  const name = order.marzban_username?.trim() || order.vpn_username?.trim();
  return name || null;
}

export const ACTIVE_NODE_STATUSES: SupabaseOrderStatus[] = ["paid"];

export type PortalOrderOption = {
  id: string;
  plan_name: string;
  marzban_username: string | null;
  label: string;
};

export function formatPortalOrderLabel(
  order: Pick<PortalOrderOption, "id" | "plan_name" | "marzban_username">,
): string {
  const user = order.marzban_username ?? "Provisioning…";
  return `${order.plan_name} · ${user} · ${order.id.slice(0, 8)}…`;
}
