import "server-only";

import { getSupabaseAdminResult } from "@/lib/supabase/admin";

export type RegisteredUserRow = {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
  linkedOrders: number;
  paidOrders: number;
  latestPlan: string | null;
  latestOrderAt: string | null;
};

type OrderLinkRow = {
  user_id: string | null;
  status: string;
  plan_name: string;
  created_at: string;
};

function aggregateOrders(orders: OrderLinkRow[]) {
  const map = new Map<
    string,
    {
      total: number;
      paid: number;
      latestPlan: string | null;
      latestOrderAt: string | null;
    }
  >();

  for (const row of orders) {
    const uid = row.user_id?.trim();
    if (!uid) continue;

    const entry = map.get(uid) ?? {
      total: 0,
      paid: 0,
      latestPlan: null,
      latestOrderAt: null,
    };
    entry.total += 1;
    if (row.status === "paid") entry.paid += 1;

    const created = row.created_at;
    if (!entry.latestOrderAt || created > entry.latestOrderAt) {
      entry.latestOrderAt = created;
      entry.latestPlan = row.plan_name;
    }
    map.set(uid, entry);
  }

  return map;
}

export async function loadRegisteredUsersForAdmin(): Promise<{
  ok: boolean;
  users: RegisteredUserRow[];
  total: number;
  error?: string;
}> {
  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return { ok: false, users: [], total: 0, error: db.error };
  }

  const { data: authData, error: authError } =
    await db.client.auth.admin.listUsers({
      page: 1,
      perPage: 500,
    });

  if (authError) {
    return { ok: false, users: [], total: 0, error: authError.message };
  }

  const { data: orderRows, error: ordersError } = await db.client
    .from("orders")
    .select("user_id, status, plan_name, created_at")
    .not("user_id", "is", null);

  if (ordersError) {
    return {
      ok: false,
      users: [],
      total: 0,
      error: ordersError.message,
    };
  }

  const orderMap = aggregateOrders((orderRows ?? []) as OrderLinkRow[]);

  const users: RegisteredUserRow[] = (authData.users ?? []).map((u) => {
    const stats = orderMap.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "—",
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? null,
      emailConfirmed: Boolean(u.email_confirmed_at),
      linkedOrders: stats?.total ?? 0,
      paidOrders: stats?.paid ?? 0,
      latestPlan: stats?.latestPlan ?? null,
      latestOrderAt: stats?.latestOrderAt ?? null,
    };
  });

  users.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    ok: true,
    users,
    total: authData.total ?? users.length,
  };
}
