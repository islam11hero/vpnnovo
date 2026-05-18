"use client";

import { useState, useTransition } from "react";
import { Loader2, Recycle, Rocket, Zap } from "lucide-react";
import { toast } from "sonner";

import {
  flushXraySessionsAction,
  promoteVipNodeAction,
} from "@/actions/admin-monitoring";
import { ConfirmDestructiveDialog } from "@/components/admin/noc/confirm-destructive-dialog";
import { PromoteVipModal } from "@/components/admin/monitoring/promote-vip-modal";
import type { MonitoringBandwidthRow } from "@/lib/monitoring-types";

type Props = {
  consumers: MonitoringBandwidthRow[];
  onRefresh: () => void;
};

export function CoreOperationsWidget({ consumers, onRefresh }: Props) {
  const [flushOpen, setFlushOpen] = useState(false);
  const [vipOpen, setVipOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const runFlush = () => {
    startTransition(async () => {
      const result = await flushXraySessionsAction();
      if (!result.success) {
        toast.error("Flush failed", { description: result.error });
        return;
      }
      toast.success("Command executed on bare-metal", {
        description: "Xray core restart queued — sessions flushed from RAM.",
      });
      setFlushOpen(false);
      onRefresh();
    });
  };

  const runPromote = (username: string) => {
    startTransition(async () => {
      const result = await promoteVipNodeAction(username);
      if (!result.success) {
        toast.error("VIP promotion failed", { description: result.error });
        return;
      }
      toast.success("Command executed on bare-metal", {
        description: `${username} promoted to VIP static routing.`,
      });
      setVipOpen(false);
      onRefresh();
    });
  };

  return (
    <>
      <div className="h-full rounded-xl border border-slate-800 bg-slate-950/80 p-6 backdrop-blur-md">
        <h2 className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-orange-400 uppercase">
          <Zap className="h-4 w-4" />
          Core Operations
        </h2>
        <p className="mb-5 text-xs text-slate-500">
          Emergency actions — all commands require confirmation.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => setFlushOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-left transition hover:bg-amber-950/40 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-400" />
            ) : (
              <Recycle className="h-5 w-5 shrink-0 text-amber-400" />
            )}
            <div>
              <p className="text-sm font-bold text-amber-200">
                ♻️ Flush Sessions
              </p>
              <p className="text-[11px] text-amber-200/60">
                Restarts Xray core and clears RAM
              </p>
            </div>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => setVipOpen(true)}
            className="flex w-full items-center gap-3 rounded-lg border border-violet-500/30 bg-violet-950/20 px-4 py-3 text-left transition hover:bg-violet-950/40 disabled:opacity-50"
          >
            <Rocket className="h-5 w-5 shrink-0 text-violet-400" />
            <div>
              <p className="text-sm font-bold text-violet-200">
                🚀 Promote to VIP Node
              </p>
              <p className="text-[11px] text-violet-200/60">
                Dedicated static routing for a slow user
              </p>
            </div>
          </button>
        </div>
      </div>

      <ConfirmDestructiveDialog
        open={flushOpen}
        onClose={() => !isPending && setFlushOpen(false)}
        onConfirm={runFlush}
        title="Flush Xray Sessions"
        description="This restarts the Marzban Xray core. All active tunnels drop for ~5–15 seconds while RAM clears."
        confirmLabel="Flush Sessions"
        pending={isPending}
      />

      <PromoteVipModal
        open={vipOpen}
        onClose={() => !isPending && setVipOpen(false)}
        consumers={consumers}
        onPromote={runPromote}
        pending={isPending}
      />
    </>
  );
}
