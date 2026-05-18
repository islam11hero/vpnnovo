import { NextResponse } from "next/server";

import { loadMonitoringPayload } from "@/lib/monitoring-loaders";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  try {
    const payload = await loadMonitoringPayload();
    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Monitoring telemetry failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
