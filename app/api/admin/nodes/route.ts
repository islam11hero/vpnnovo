import { NextResponse } from "next/server";

import { loadAdminNodes } from "@/lib/admin-nodes-service";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  const result = await loadAdminNodes();
  if (!result.ok) {
    console.error("[admin:nodes]", result.error);
    return NextResponse.json({
      success: true,
      nodes: [],
      telemetryUnreachable: true,
    });
  }

  return NextResponse.json({
    success: true,
    nodes: result.payload.nodes,
    telemetryUnreachable: result.payload.telemetryUnreachable,
  });
}
