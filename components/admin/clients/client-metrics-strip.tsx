import { AlertTriangle, Shield, ShieldOff, Timer } from "lucide-react";

import type { ClientGridMetrics } from "@/lib/marzban-client-metrics";

type Props = {
  metrics: ClientGridMetrics;
  marzbanOnline: boolean;
  error?: string;
};

const CARDS = [
  {
    key: "total" as const,
    label: "Total Provisioned",
    icon: Shield,
    accent: "text-cyan-400",
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/5",
  },
  {
    key: "expiring" as const,
    label: "Expiring Soon",
    icon: Timer,
    accent: "text-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
  },
  {
    key: "suspended" as const,
    label: "Suspended",
    icon: ShieldOff,
    accent: "text-red-400",
    border: "border-red-500/20",
    bg: "bg-red-500/5",
  },
];

export function ClientMetricsStrip({ metrics, marzbanOnline, error }: Props) {
  const values = {
    total: metrics.totalProvisioned,
    expiring: metrics.expiringSoon,
    suspended: metrics.suspended,
  };

  return (
    <div className="space-y-3">
      {!marzbanOnline ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-950/20 px-4 py-2 text-xs text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Live telemetry delayed — showing Supabase cache
          {error ? ` (${error})` : ""}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className={`rounded-xl border ${card.border} ${card.bg} bg-slate-950/60 p-6 backdrop-blur-md`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                  {card.label}
                </p>
                <Icon className={`h-4 w-4 ${card.accent}`} />
              </div>
              <p className={`mt-3 font-mono text-3xl font-black ${card.accent}`}>
                {values[card.key]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
