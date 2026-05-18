"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function MonitoringError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin/monitoring]", error);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-10 text-center">
      <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-red-400" />
      <h2 className="font-poppins text-lg font-bold text-white">
        Monitoring room fault
      </h2>
      <p className="mt-2 text-sm text-red-200/80">
        Telemetry widgets failed to render. APIs may be delayed — retry without
        crashing the admin shell.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
      >
        Reset monitoring view
      </button>
    </div>
  );
}
