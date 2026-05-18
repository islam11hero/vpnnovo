"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity } from "lucide-react";

import type { MonitoringResourcePoint } from "@/lib/monitoring-types";

type Props = {
  data: MonitoringResourcePoint[];
};

export function ResourceMetricsChart({ data }: Props) {
  const safeData = data.length ? data : [{ time: "—", cpu: 0, ram: 0 }];

  return (
    <div className="h-full rounded-xl border border-slate-800 bg-slate-950/80 p-6 backdrop-blur-md">
      <h2 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">
        <Activity className="h-4 w-4" />
        CPU &amp; RAM Load
      </h2>
      <div className="h-[220px] w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%" minHeight={220}>
          <LineChart data={safeData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#64748b", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: "#020617",
                border: "1px solid #334155",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name) => [
                `${Number(value ?? 0)}%`,
                String(name) === "cpu" ? "CPU" : "RAM",
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(value) => (
                <span className="text-slate-400">{value === "cpu" ? "CPU" : "RAM"}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="#34d399"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#34d399" }}
              style={{ filter: "drop-shadow(0 0 6px rgba(52,211,153,0.6))" }}
            />
            <Line
              type="monotone"
              dataKey="ram"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#a78bfa" }}
              style={{ filter: "drop-shadow(0 0 6px rgba(167,139,250,0.5))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
