import { NextResponse } from "next/server";

import { checkAdminDatabaseHealth } from "@/lib/admin-db-health";
import { checkMarzbanConnection } from "@/lib/marzban";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";
import { getSystemConfigFlags } from "@/lib/system-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  const systemConfig = getSystemConfigFlags();
  const marzbanOnline =
    systemConfig.isMarzbanConfigured && (await checkMarzbanConnection());

  const dbHealth = await checkAdminDatabaseHealth();

  const nowpaymentsConfigured = Boolean(
    process.env.NOWPAYMENTS_API_KEY?.trim() &&
      process.env.NOWPAYMENTS_IPN_SECRET?.trim(),
  );

  return NextResponse.json({
    success: true,
    ...systemConfig,
    marzban_online: marzbanOnline,
    site_url: process.env.NEXT_PUBLIC_SITE_URL ?? "Not configured",
    admin_edge_auth: true,
    nowpayments_configured: nowpaymentsConfigured,
    database_schema_ok: dbHealth.ok,
    database_tables: dbHealth.tables,
    orders_telemetry_columns: dbHealth.ordersTelemetryColumns,
    database_error: dbHealth.error ?? null,
  });
}
