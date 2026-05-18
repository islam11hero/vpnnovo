import { NextResponse } from "next/server";

import { loadNocFleetBlock } from "@/lib/noc-overview-loaders";
import { EMPTY_FLEET } from "@/lib/noc-fallbacks";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) return unauthorizedAdminResponse();
  try {
    const fleet = await loadNocFleetBlock();
    return NextResponse.json({ success: true, fleet });
  } catch (e) {
    console.error("[admin:noc/fleet]", e);
    return NextResponse.json({ success: true, fleet: EMPTY_FLEET, degraded: true });
  }
}
