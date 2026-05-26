"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

/** Fixed bottom bar on small screens — keeps trial + buy one tap away. */
export function StickyMobileCta() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur-xl md:hidden"
      role="navigation"
      aria-label="Quick actions"
    >
      <div className="mx-auto flex max-w-lg gap-2">
        <Link
          href="#free-trial"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-600 py-3 text-xs font-black text-white"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Free trial
        </Link>
        <Link
          href="#pricing"
          className="flex flex-1 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 py-3 text-xs font-black text-slate-100"
        >
          Buy with crypto
        </Link>
      </div>
    </div>
  );
}
