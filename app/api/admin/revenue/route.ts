import { NextResponse } from "next/server";

import { buildRevenueChartData } from "@/lib/revenue-chart";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";
import { requireSupabaseAdmin } from "@/lib/supabase/route-handler";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  const db = requireSupabaseAdmin();
  if (!db.ok) {
    return db.response;
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data: orders, error } = await db.client
    .from("orders")
    .select("amount, created_at")
    .eq("status", "paid")
    .gte("created_at", since.toISOString());

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }

  const chartData = buildRevenueChartData(orders ?? []);

  return NextResponse.json({ success: true, chartData });
}
