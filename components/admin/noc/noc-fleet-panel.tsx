"use client";

import { Cpu, Globe, HardDrive, MemoryStick, Server } from "lucide-react";

import { ApiOfflineBadge } from "@/components/admin/noc/api-offline-badge";
import { NocEmptyState } from "@/components/admin/noc/noc-empty-state";
import type { NocFleetMetrics } from "@/lib/noc-types";

type Props = {
  fleet: NocFleetMetrics;
  onNukeClick?: () => void;
};

export function NocFleetPanel({ fleet, onNukeClick }: Props) {
  const instance = fleet.instance;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-bold tracking-wide text-white uppercase">
            Infrastructure Fleet
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Live Vultr compute — primary egress node
          </p>
        </div>
        {!fleet.vultr.online ? <ApiOfflineBadge label="Vultr Offline" /> : null}
      </div>

      {!fleet.vultr.online ? (
        <NocEmptyState
          compact
          icon={Server}
          title="Fleet API Offline"
          description="Vultr telemetry unavailable. Metrics display as zero until the API responds."
        />
      ) : instance ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-4 sm:grid-cols-2">
            <SpecRow icon={Server} label="OS" value={instance.os} />
            <SpecRow
              icon={Cpu}
              label="vCPU"
              value={`${instance.vcpuCount} cores`}
            />
            <SpecRow
              icon={MemoryStick}
              label="RAM"
              value={`${(instance.ramMb / 1024).toFixed(1)} GB`}
            />
            <SpecRow
              icon={HardDrive}
              label="Bandwidth Cap"
              value={`${instance.allowedBandwidthGb} GB / mo`}
            />
            <SpecRow icon={Globe} label="Region" value={instance.region} />
            <SpecRow
              icon={Server}
              label="Power"
              value={instance.powerStatus}
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 lg:min-w-[240px]">
            <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
              Egress IP
            </p>
            <p className="mt-2 font-mono text-lg font-black text-cyan-400">
              {instance.mainIp}
            </p>
            <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-[10px] font-bold text-amber-400 uppercase">
                Trust Score
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Pending API Sync — MaxMind integration slot
              </p>
            </div>
          </div>
        </div>
      ) : (
        <NocEmptyState
          compact
          icon={Server}
          title="Awaiting First Deployment"
          description="No Vultr instance linked. Set VULTR_API_KEY and optional VULTR_INSTANCE_ID."
        />
      )}

      <div className="mt-6 border-t border-slate-800 pt-6">
        <button
          type="button"
          onClick={onNukeClick}
          className="w-full rounded-lg border border-red-500/50 bg-red-950/40 px-4 py-3 text-sm font-black tracking-wide text-red-400 uppercase transition hover:bg-red-950/70"
        >
          Nuke & Rebuild Fleet Node
        </button>
        <p className="mt-2 text-center text-[10px] text-slate-600">
          Destructive re-provision — requires CEO unlock + confirmation
        </p>
      </div>
    </div>
  );
}

function SpecRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Server;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-800/80 bg-slate-900/40 px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-slate-500" />
      <div>
        <p className="text-[10px] font-bold text-slate-600 uppercase">{label}</p>
        <p className="text-sm font-semibold text-slate-200">{value}</p>
      </div>
    </div>
  );
}
