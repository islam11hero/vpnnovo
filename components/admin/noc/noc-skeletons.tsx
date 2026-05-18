"use client";

export function FinancialStripSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/80 p-5"
        >
          <div className="h-3 w-24 rounded bg-slate-800" />
          <div className="mt-4 h-9 w-32 rounded bg-slate-800" />
          <div className="mt-2 h-2 w-20 rounded bg-slate-800/80" />
        </div>
      ))}
    </div>
  );
}

export function FleetPanelSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/80 p-6">
      <div className="mb-6 h-4 w-40 rounded bg-slate-800" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-slate-800/80" />
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/80 p-6">
      <div className="h-4 w-36 rounded bg-slate-800" />
      <div className="mt-6 h-[340px] rounded-lg bg-slate-800/80" />
    </div>
  );
}

export function HealthSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-800 bg-slate-900/80 p-6">
      <div className="mb-6 h-4 w-32 rounded bg-slate-800" />
      <div className="flex justify-around gap-6">
        <div className="h-24 w-24 rounded-full bg-slate-800" />
        <div className="h-24 w-24 rounded-full bg-slate-800" />
      </div>
    </div>
  );
}

export function CrmTableSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80">
      <div className="border-b border-slate-800 p-5">
        <div className="h-4 w-48 rounded bg-slate-800" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 border-b border-slate-800/50 px-5 py-4">
          <div className="h-4 w-24 rounded bg-slate-800" />
          <div className="h-4 flex-1 rounded bg-slate-800/80" />
        </div>
      ))}
    </div>
  );
}
