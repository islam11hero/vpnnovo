import { NextResponse } from "next/server";

import { loadNocHealthBlock } from "@/lib/noc-overview-loaders";
import { EMPTY_HEALTH } from "@/lib/noc-fallbacks";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) return unauthorizedAdminResponse();
  try {
    const health = await loadNocHealthBlock();
    return NextResponse.json({ success: true, health });
  } catch (e) {
    console.error("[admin:noc/health]", e);
    return NextResponse.json({ success: true, health: EMPTY_HEALTH, degraded: true });
  }
}
