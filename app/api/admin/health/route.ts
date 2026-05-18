import { NextResponse } from "next/server";

import { checkMarzbanConnection } from "@/lib/marzban";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  const marzbanOnline = await checkMarzbanConnection();

  return NextResponse.json({
    success: true,
    marzban_online: marzbanOnline,
    site_url: process.env.NEXT_PUBLIC_SITE_URL ?? "Not configured",
    admin_edge_auth: true,
    zero_log_tickets: true,
  });
}
