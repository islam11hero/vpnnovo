import { NextResponse } from "next/server";

import { buildGrowthChart } from "@/lib/noc-live-metrics";
import { isAdminAuthenticated, unauthorizedAdminResponse } from "@/lib/require-admin";
import { getSupabaseAdminResult } from "@/lib/supabase/admin";
import type { SupabaseOrder } from "@/lib/supabase/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdminAuthenticated()) {
    return unauthorizedAdminResponse();
  }

  const db = getSupabaseAdminResult();
  if (!db.ok) {
    console.error("[admin:revenue]", db.error);
    return NextResponse.json({
      success: true,
      chartData: buildGrowthChart([]).map((d) => ({
        name: d.name,
        revenue: d.revenue,
      })),
      growth: buildGrowthChart([]),
    });
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data: orders, error } = await db.client
    .from("orders")
    .select("amount, created_at, plan_name, status")
    .eq("status", "paid")
    .gte("created_at", since.toISOString());

  if (error) {
    console.error("[admin:revenue]", error.message);
    return NextResponse.json({
      success: true,
      chartData: buildGrowthChart([]).map((d) => ({
        name: d.name,
        revenue: d.revenue,
      })),
      growth: buildGrowthChart([]),
    });
  }

  const paid = (orders ?? []) as SupabaseOrder[];
  const growth = buildGrowthChart(paid);

  return NextResponse.json({
    success: true,
    chartData: growth.map((d) => ({ name: d.name, revenue: d.revenue })),
    growth,
  });
}
