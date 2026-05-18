import { NextResponse } from "next/server";

import { loadNocChartBlock } from "@/lib/noc-overview-loaders";
import { emptyGrowthChart } from "@/lib/noc-fallbacks";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) return unauthorizedAdminResponse();
  try {
    const chart = await loadNocChartBlock();
    return NextResponse.json({ success: true, chart });
  } catch (e) {
    console.error("[admin:noc/chart]", e);
    return NextResponse.json({ success: true, chart: emptyGrowthChart(), degraded: true });
  }
}
