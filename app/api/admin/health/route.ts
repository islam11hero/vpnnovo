import { NextResponse } from "next/server";

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

  return NextResponse.json({
    success: true,
    ...systemConfig,
    marzban_online: marzbanOnline,
    site_url: process.env.NEXT_PUBLIC_SITE_URL ?? "Not configured",
    admin_edge_auth: true,
    zero_log_tickets: systemConfig.isSupabaseConfigured,
  });
}
