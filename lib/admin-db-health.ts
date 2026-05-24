import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdminResult } from "@/lib/supabase/admin";

export type DbTableCheck = {
  table: string;
  ok: boolean;
  error?: string;
};

export type AdminDbHealth = {
  ok: boolean;
  tables: DbTableCheck[];
  ordersTelemetryColumns: boolean;
  error?: string;
};

const REQUIRED_TABLES = ["orders", "tickets", "proxy_orders", "trial_logs"] as const;

async function tableReachable(
  client: SupabaseClient,
  table: string,
): Promise<DbTableCheck> {
  const { error } = await client.from(table).select("id").limit(1);
  if (!error) {
    return { table, ok: true };
  }
  const msg = error.message ?? "unknown error";
  const missing =
    msg.includes("does not exist") ||
    msg.includes("schema cache") ||
    msg.includes("Could not find the table");
  return { table, ok: !missing, error: msg };
}

async function ordersTelemetryReady(client: SupabaseClient): Promise<boolean> {
  const { error } = await client
    .from("orders")
    .select("id, used_traffic, data_limit, marzban_status")
    .limit(1);
  if (!error) return true;
  const msg = error.message ?? "";
  return !(
    msg.includes("used_traffic") ||
    msg.includes("data_limit") ||
    msg.includes("marzban_status")
  );
}

export async function checkAdminDatabaseHealth(): Promise<AdminDbHealth> {
  const db = getSupabaseAdminResult();
  if (!db.ok) {
    return {
      ok: false,
      tables: [],
      ordersTelemetryColumns: false,
      error: db.error,
    };
  }

  const tables = await Promise.all(
    REQUIRED_TABLES.map((table) => tableReachable(db.client, table)),
  );
  const ordersTelemetryColumns = await ordersTelemetryReady(db.client);

  const ok =
    tables.every((t) => t.ok) &&
    ordersTelemetryColumns;

  return { ok, tables, ordersTelemetryColumns };
}
