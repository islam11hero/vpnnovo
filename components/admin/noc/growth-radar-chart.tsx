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

import type { NocGrowthPoint } from "@/lib/noc-types";

type Props = {
  data: NocGrowthPoint[];
};

export function GrowthRadarChart({ data }: Props) {
  return (
    <div className="h-[340px] w-full min-h-[340px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={340}>
        <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="nocRevenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="nocTrafficGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
            dy={8}
          />
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(v) => `$${v}`}
            width={48}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickFormatter={(v) => `${v} TB`}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(2, 6, 23, 0.95)",
              border: "1px solid #334155",
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              fontSize: "12px",
              fontWeight: 600,
            }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(value, name) => {
              const v = Number(value ?? 0);
              if (name === "revenue") return [`$${v.toFixed(0)}`, "Revenue"];
              return [`${v.toFixed(2)} TB`, "Traffic"];
            }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#22d3ee"
            strokeWidth={2.5}
            fill="url(#nocRevenueGrad)"
            dot={false}
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="trafficTb"
            stroke="#a78bfa"
            strokeWidth={2.5}
            fill="url(#nocTrafficGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
