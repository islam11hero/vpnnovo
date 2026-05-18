"use client";

export function ApiOfflineBadge({ label = "API Offline" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-red-400 uppercase">
      {label}
    </span>
  );
}
