"use client";

import { Terminal } from "lucide-react";

import type { MonitoringAbuseAlert } from "@/lib/monitoring-types";

type Props = {
  alerts: MonitoringAbuseAlert[];
};

export function AbuseAlertsTerminal({ alerts }: Props) {
  return (
    <div className="h-full rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="border-b border-slate-800 px-6 py-4">
        <h2 className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
          <Terminal className="h-4 w-4" />
          Abuse Alerts
        </h2>
      </div>
      <div className="max-h-64 overflow-y-auto p-4 font-mono text-xs">
        <p className="mb-3 text-emerald-600/80">
          ipnova-abuse@noc:~$ tail -f /var/log/xray/abuse.log
        </p>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`mb-2 rounded border px-3 py-2 leading-relaxed ${
              alert.severity === "critical"
                ? "border-red-500/30 bg-red-950/30 text-red-200"
                : "border-amber-500/20 bg-amber-950/20 text-amber-100/90"
            }`}
          >
            <span className="text-slate-600">
              [{new Date(alert.timestamp).toLocaleTimeString()}]
            </span>{" "}
            {alert.message}
          </div>
        ))}
      </div>
    </div>
  );
}
