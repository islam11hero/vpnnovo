import "server-only";

import {
  ACTIVE_NODE_STATUSES,
  formatPortalOrderLabel,
  resolveMarzbanUsername,
  type PortalOrderOption,
} from "@/lib/orders";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";
import { isValidUuid } from "@/lib/uuid";

const ORDER_SELECT =
  "id, user_id, plan_name, status, vpn_username, marzban_username";

export async function loadPortalActiveOrders(
  loginOrderId: string,
): Promise<PortalOrderOption[]> {
  if (!isValidUuid(loginOrderId)) return [];

  const db = getSupabaseAdminResult();
  if (!db.ok) return [];

  const { data: anchor } = await db.client
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", loginOrderId)
    .maybeSingle();

  if (!anchor) return [];

  const anchorRow = anchor as SupabaseOrder;
  let query = db.client
    .from("orders")
    .select(ORDER_SELECT)
    .in("status", ACTIVE_NODE_STATUSES)
    .order("created_at", { ascending: false });

  if (anchorRow.user_id) {
    query = query.eq("user_id", anchorRow.user_id);
  } else {
    query = query.eq("id", loginOrderId);
  }

  const { data: rows } = await query;
  const orders = (rows ?? []) as SupabaseOrder[];

  return orders
    .filter((o) => resolveMarzbanUsername(o) || o.id === loginOrderId)
    .map((o) => {
      const marzban_username = resolveMarzbanUsername(o);
      const base = {
        id: o.id,
        plan_name: o.plan_name,
        marzban_username,
      };
      return {
        ...base,
        label: formatPortalOrderLabel(base),
      };
    });
}
