"use client";

import { useState } from "react";
import {
  Gauge,
  Radar,
  RefreshCw,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch";

type ToggleDef = {
  id: string;
  icon: typeof Zap;
  label: string;
  description: string;
};

const TOGGLES: ToggleDef[] = [
  {
    id: "bbr",
    icon: Zap,
    label: "Inject TCP BBRv3 Congestion Control",
    description: "Boosts XHTTP proxy speeds on egress nodes.",
  },
  {
    id: "doh",
    icon: RefreshCw,
    label: "Enable Upstream DNS Rotator (DoH)",
    description: "Prevents ISP DNS profiling on fleet nodes.",
  },
  {
    id: "lb",
    icon: Gauge,
    label: "Multi-Node Load Balancing",
    description: "Automatic failover across Vultr regions.",
  },
  {
    id: "abuse",
    icon: Shield,
    label: "Automated Abuse Commando",
    description: "Auto-suspend instances exceeding 500 connections/sec.",
  },
];

export function InfrastructureOpsCard() {
  const [state, setState] = useState<Record<string, boolean>>({});

  const flip = (id: string, next: boolean) => {
    setState((prev) => ({ ...prev, [id]: next }));
    toast.message("Infrastructure feature queued for future SSH deployment", {
      description: next ? "Toggle armed in UI preview." : "Toggle disarmed.",
    });
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 backdrop-blur-md">
      <div className="mb-6 flex items-start gap-3">
        <Radar className="h-5 w-5 shrink-0 text-cyan-400" />
        <div>
          <h2 className="text-sm font-bold tracking-wide text-white uppercase">
            Advanced Routing & Stealth Operations
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Visual prep for SSH/Xray fleet automation — no backend writes yet
          </p>
        </div>
      </div>

      <ul className="space-y-4">
        {TOGGLES.map((toggle) => {
          const Icon = toggle.icon;
          const checked = Boolean(state[toggle.id]);
          return (
            <li
              key={toggle.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-3.5"
            >
              <div className="flex min-w-0 items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {toggle.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {toggle.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={checked}
                onCheckedChange={(v) => flip(toggle.id, v)}
                aria-label={toggle.label}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
