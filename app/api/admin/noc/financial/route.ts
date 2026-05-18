import { NextResponse } from "next/server";

import { loadNocFinancialBlock } from "@/lib/noc-overview-loaders";
import { EMPTY_BANDWIDTH, EMPTY_FINANCIAL } from "@/lib/noc-fallbacks";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) return unauthorizedAdminResponse();
  try {
    const data = await loadNocFinancialBlock();
    return NextResponse.json({ success: true, ...data });
  } catch (e) {
    console.error("[admin:noc/financial]", e);
    return NextResponse.json({
      success: true,
      financial: EMPTY_FINANCIAL,
      bandwidth: EMPTY_BANDWIDTH,
      degraded: true,
    });
  }
}
