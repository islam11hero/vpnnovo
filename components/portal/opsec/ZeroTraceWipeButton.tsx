"use client";

import { useState, useTransition } from "react";
import { Loader2, Terminal } from "lucide-react";
import { toast } from "sonner";

import { zeroTraceSessionWipeAction } from "@/actions/client-opsec";
import { Dialog } from "@/components/ui/dialog";

type Props = {
  orderId: string;
  disabled?: boolean;
  onWiped: (newSubLink: string) => void;
};

export function ZeroTraceWipeButton({ orderId, disabled, onWiped }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const runWipe = () => {
    startTransition(async () => {
      const result = await zeroTraceSessionWipeAction(orderId);
      if (!result.success || !result.data) {
        toast.error("Wipe failed", {
          description: result.success ? "No subscription link returned." : result.error,
        });
        return;
      }
      toast.success("Zero-trace wipe complete", {
        description: "New untraceable VLESS UUID · fresh subscription link.",
      });
      onWiped(result.data.newSubLink);
      setOpen(false);
    });
  };

  return (
    <>
      <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-5 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-red-400" />
          <p className="text-xs font-bold tracking-widest text-red-400 uppercase">
            Zero-Trace Session Wipe
          </p>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-red-200/70">
          Instantly burns your current session, wipes connection history, and
          generates a new untraceable VLESS UUID.
        </p>
        <button
          type="button"
          disabled={disabled || isPending}
          onClick={() => setOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-red-600/80 px-4 py-3 text-sm font-black tracking-wide text-white uppercase transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>💥 Zero-Trace Session Wipe</>
          )}
        </button>
      </div>

      <Dialog
        open={open}
        onClose={() => !isPending && setOpen(false)}
        title="Confirm Zero-Trace Wipe"
        description="This cannot be undone. All devices using the current config will disconnect immediately."
        variant="destructive"
      >
        <ul className="mb-5 list-inside list-disc space-y-1 text-xs text-slate-400">
          <li>Marzban usage counter reset</li>
          <li>VLESS proxy UUID rotated</li>
          <li>Subscription link regenerated</li>
        </ul>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={() => setOpen(false)}
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={runWipe}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Confirm Wipe
          </button>
        </div>
      </Dialog>
    </>
  );
}
