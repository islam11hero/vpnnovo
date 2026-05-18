"use client";

import { Globe, Server } from "lucide-react";

import { AdminFraudGauge } from "@/components/admin/monitoring/admin-fraud-gauge";
import { ApiOfflineBadge } from "@/components/admin/noc/api-offline-badge";
import type { MonitoringIpReputation } from "@/lib/monitoring-types";

type Props = {
  data: MonitoringIpReputation;
};

export function IpReputationWidget({ data }: Props) {
  return (
    <div className="h-full rounded-xl border border-slate-800 bg-slate-950/80 p-6 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">
          <Globe className="h-4 w-4" />
          IP Reputation &amp; Risk
        </h2>
        {!data.vultrOnline ? <ApiOfflineBadge label="Vultr" /> : null}
      </div>

      <p className="mb-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
        Vultr Server IP
      </p>
      <p className="font-mono text-lg font-bold text-white">{data.serverIp}</p>
      <p className="mt-1 text-xs text-slate-500">{data.region}</p>

      <div className="my-6">
        <AdminFraudGauge score={data.fraudScore} />
        <p className="mt-2 text-center text-[10px] font-bold text-slate-500 uppercase">
          Real-time Fraud Score
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase ${
            data.blacklistStatus === "clean"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/40 bg-red-500/10 text-red-400"
          }`}
        >
          Blacklist: {data.blacklistStatus === "clean" ? "Clean" : "Listed"}
        </span>
        <span
          className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase ${
            data.asnType === "residential"
              ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
              : "border-violet-500/30 bg-violet-500/10 text-violet-300"
          }`}
        >
          <Server className="h-3 w-3" />
          {data.asnType === "residential" ? "Residential" : "Datacenter"}
        </span>
      </div>

      <div className="mt-4 space-y-1 border-t border-slate-800 pt-4 font-mono text-[11px] text-slate-500">
        <p>{data.isp}</p>
        <p>{data.asn}</p>
      </div>
    </div>
  );
}
