import type { SupabaseOrder } from "@/lib/supabase/types";

export type RevenueChartPoint = { name: string; revenue: number };

/** Sum paid order amounts per day for the last 7 days. */
export function buildRevenueChartData(
  orders: Pick<SupabaseOrder, "amount" | "created_at">[],
): RevenueChartPoint[] {
  const points: RevenueChartPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);

    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const revenue = orders
      .filter((o) => {
        const created = new Date(o.created_at);
        return created >= day && created < nextDay;
      })
      .reduce((sum, o) => sum + Number(o.amount), 0);

    points.push({
      name: day.toLocaleDateString("en-US", { weekday: "short" }),
      revenue: Number(revenue.toFixed(2)),
    });
  }

  return points;
}
