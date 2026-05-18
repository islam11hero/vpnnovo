"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

type Props = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function NocWidgetFallback({
  title = "Telemetry delayed",
  message,
  onRetry,
}: Props) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-6">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-amber-200">{title}</p>
          <p className="mt-1 text-xs text-amber-100/70">{message}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-slate-300 uppercase hover:border-cyan-500/40"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
