"use client";

import { Database } from "lucide-react";

import { ApiOfflineBadge } from "@/components/admin/noc/api-offline-badge";
import { NocEmptyState } from "@/components/admin/noc/noc-empty-state";
import type { MonitoringBandwidthRow } from "@/lib/monitoring-types";

type Props = {
  rows: MonitoringBandwidthRow[];
  marzbanOnline: boolean;
};

export function BandwidthConsumersTable({ rows, marzbanOnline }: Props) {
  return (
    <div className="h-full rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 px-6 py-4">
        <h2 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
          <Database className="h-4 w-4" />
          Top Bandwidth Consumers (24h)
        </h2>
        {!marzbanOnline ? <ApiOfflineBadge label="Marzban" /> : null}
      </div>

      {!marzbanOnline ? (
        <div className="p-6">
          <NocEmptyState
            title="Marzban offline"
            description="Cannot rank users by used_traffic until the panel API responds."
          />
        </div>
      ) : rows.length === 0 ? (
        <div className="p-6">
          <NocEmptyState
            title="No traffic data"
            description="No Marzban users with bandwidth usage in the last window."
            compact
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Protocol</th>
                <th className="px-6 py-3 text-right">GB Burned</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={row.username}
                  className="border-b border-slate-800/50 transition hover:bg-slate-900/50"
                >
                  <td className="px-6 py-3 font-mono text-xs font-bold text-white">
                    <span className="mr-2 text-slate-600">#{i + 1}</span>
                    {row.username}
                  </td>
                  <td className="px-6 py-3 text-xs text-violet-300">{row.protocol}</td>
                  <td className="px-6 py-3 text-right font-mono text-sm font-bold text-cyan-400">
                    {row.usedGb.toFixed(2)} GB
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
