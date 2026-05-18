"use client";

import type { LucideIcon } from "lucide-react";
import { Server, Shield } from "lucide-react";

type Props = {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  compact?: boolean;
};

export function NocEmptyState({
  icon: Icon = Shield,
  title = "Awaiting First Deployment",
  description = "Pre-launch telemetry is clear. Provision your first VIP instance or complete a storefront checkout to populate this grid.",
  compact = false,
}: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "py-12 px-6" : "py-20 px-8"
      }`}
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80">
          <Icon className="h-9 w-9 text-slate-500" strokeWidth={1.5} />
          <Server className="absolute -bottom-1 -right-1 h-5 w-5 text-cyan-500/60" />
        </div>
      </div>
      <h3 className="font-poppins text-lg font-bold text-slate-200">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}
