"use client";

import { ApiOfflineBadge } from "@/components/admin/noc/api-offline-badge";
import type { NocHealthMetrics } from "@/lib/noc-types";

type Props = {
  health: NocHealthMetrics;
};

function Gauge({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-poppins text-lg font-black text-white">
          {value}
        </span>
      </div>
      <p className="mt-2 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
        {label}
      </p>
    </div>
  );
}

export function SystemHealthNoc({ health }: Props) {
  const maxUsers = Math.max(health.marzbanUserCount, 1);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-wide text-white uppercase">
            System Health
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Marzban sessions · Vultr fleet status
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!health.marzban.online ? (
            <ApiOfflineBadge label="Marzban Offline" />
          ) : null}
          {!health.vultr.online ? (
            <ApiOfflineBadge label="Vultr Offline" />
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap justify-around gap-6">
        <Gauge
          label="Active Sessions"
          value={health.activeConnections}
          max={maxUsers}
          color="#22d3ee"
        />
        <Gauge
          label="Marzban Users"
          value={health.marzbanUserCount}
          max={maxUsers}
          color="#a78bfa"
        />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <StatusRow label="Marzban API" value={health.marzbanOnline ? "Online" : "Offline"} />
        <StatusRow label="Vultr Power" value={health.vultrPowerStatus} />
        <StatusRow label="Vultr Server" value={health.vultrServerStatus} />
        <StatusRow
          label="Live Sessions"
          value={String(health.activeConnections)}
        />
      </div>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="text-xs font-bold text-slate-200">{value}</span>
    </div>
  );
}
