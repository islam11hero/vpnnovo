"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-5 py-2.5 text-sm font-bold text-slate-200 transition-all hover:border-cyan-500/40 hover:text-cyan-400"
    >
      <RefreshCw className="h-4 w-4" />
      Refresh status
    </button>
  );
}
