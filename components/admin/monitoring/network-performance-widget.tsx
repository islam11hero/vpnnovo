"use client";

import { Gauge, Wifi } from "lucide-react";

import type { MonitoringNetworkMetrics } from "@/lib/monitoring-types";

type Props = {
  data: MonitoringNetworkMetrics;
};

function LatencyBar({
  label,
  ms,
  barClass,
  textClass,
}: {
  label: string;
  ms: number;
  barClass: string;
  textClass: string;
}) {
  const width = Math.min(100, Math.max(8, (ms / 120) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="font-mono text-slate-400">{label}</span>
        <span className={`font-mono font-bold ${textClass}`}>{ms}ms</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function NetworkPerformanceWidget({ data }: Props) {
  return (
    <div className="h-full rounded-xl border border-slate-800 bg-slate-950/80 p-6 backdrop-blur-md">
      <h2 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-violet-400 uppercase">
        <Wifi className="h-4 w-4" />
        Network Performance &amp; Latency
      </h2>

      <div className="space-y-5">
        <LatencyBar
          label="api.stripe.com"
          ms={data.stripeRttMs}
          barClass="bg-emerald-500"
          textClass="text-emerald-400"
        />
        <LatencyBar
          label="graph.facebook.com"
          ms={data.facebookRttMs}
          barClass="bg-cyan-500"
          textClass="text-cyan-400"
        />
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <Gauge className="h-8 w-8 text-emerald-400" />
        <div>
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Packet Loss Rate
          </p>
          <p className="font-mono text-xl font-black text-emerald-400">
            {data.packetLossPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {!data.measured ? (
        <p className="mt-3 text-[10px] text-slate-600">
          RTT fallback values — edge probe blocked; check egress firewall.
        </p>
      ) : null}
    </div>
  );
}
