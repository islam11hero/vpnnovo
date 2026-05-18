"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenueChartPoint } from "@/lib/revenue-chart";

type Props = {
  data: RevenueChartPoint[];
  empty?: boolean;
};

export function RevenueChart({ data, empty }: Props) {
  if (empty || data.every((d) => d.revenue === 0)) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-400">
        No paid orders in the last 7 days yet.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="adminRevenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748B", fontSize: 12 }}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.08)",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(8px)",
            }}
            formatter={(value) => [
              `$${Number(value ?? 0).toFixed(2)}`,
              "Revenue",
            ]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#10B981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#adminRevenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
