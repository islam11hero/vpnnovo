import { NextResponse } from "next/server";

import { buildRevenueChartData } from "@/lib/revenue-chart";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { success: false, error: "Supabase not configured" },
      { status: 500 },
    );
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data: orders, error } = await supabaseAdmin
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
