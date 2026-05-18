"use client";

import { DollarSign, HardDrive, TrendingDown, TrendingUp } from "lucide-react";

import { ApiOfflineBadge } from "@/components/admin/noc/api-offline-badge";
import { formatUsd, netProfitValueClass } from "@/lib/format-currency";
import { formatBytes } from "@/lib/format-bytes";
import type {
  NocBandwidthMetrics,
  NocFinancialMetrics,
} from "@/lib/noc-types";

type Props = {
  financial: NocFinancialMetrics;
  bandwidth: NocBandwidthMetrics;
};

export function NocFinancialStrip({ financial, bandwidth }: Props) {
  const netProfitClass = netProfitValueClass(financial.netProfit);

  const cards = [
    {
      label: "MRR (30d normalized)",
      value: formatUsd(financial.mrr),
      valueClass: "text-white",
      icon: TrendingUp,
      iconColor: "text-cyan-400",
      accent: "from-cyan-500/20 to-blue-600/5",
      offline: !financial.supabase.online,
    },
    {
      label: "Net Profit",
      value: formatUsd(financial.netProfit),
      valueClass: netProfitClass,
      sub: `Vultr pending: ${formatUsd(financial.vultrPendingCharges)}`,
      icon: DollarSign,
      iconColor: financial.netProfit >= 0 ? "text-emerald-400" : "text-red-400",
      accent:
        financial.netProfit >= 0
          ? "from-emerald-500/20 to-emerald-600/5"
          : "from-red-500/20 to-red-600/5",
      offline: !financial.supabase.online || !financial.vultr.online,
    },
    {
      label: "Paid Orders",
      value: String(financial.paidOrderCount),
      valueClass: "text-white",
      icon: TrendingDown,
      iconColor: "text-violet-400",
      accent: "from-violet-500/20 to-violet-600/5",
      offline: !financial.supabase.online,
    },
    {
      label: "Bandwidth Burn",
      value: formatBytes(bandwidth.marzbanUsedBytes),
      valueClass: "text-white",
      sub:
        bandwidth.vultrAllowedGb > 0
          ? `${bandwidth.burnPercent.toFixed(1)}% of ${bandwidth.vultrAllowedGb.toFixed(0)} GB cap`
          : `${formatBytes(bandwidth.marzbanUsedBytes)} egress`,
      icon: HardDrive,
      iconColor: bandwidth.burnPercent >= 90 ? "text-red-400" : "text-indigo-400",
      accent: "from-indigo-500/20 to-indigo-600/5",
      offline: !bandwidth.marzban.online || !bandwidth.vultr.online,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br ${card.accent} bg-slate-950/90 p-5`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-bold tracking-[0.15em] text-slate-500 uppercase">
                    {card.label}
                  </p>
                  {card.offline ? <ApiOfflineBadge /> : null}
                </div>
                <p
                  className={`mt-2 font-poppins text-3xl font-black tabular-nums ${card.valueClass}`}
                >
                  {card.value}
                </p>
                {card.sub ? (
                  <p className="mt-1 text-[10px] font-medium text-slate-500">
                    {card.sub}
                  </p>
                ) : null}
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2.5">
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
