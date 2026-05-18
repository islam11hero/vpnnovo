"use client";

export function MonitoringPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse space-y-2">
        <div className="h-8 w-72 rounded bg-slate-800" />
        <div className="h-4 w-96 max-w-full rounded bg-slate-800/80" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`animate-pulse rounded-xl border border-slate-800 bg-slate-900/80 p-6 ${
              i === 0
                ? "lg:col-span-4"
                : i === 1
                  ? "lg:col-span-8"
                  : i < 4
                    ? "lg:col-span-6"
                    : i === 4
                      ? "lg:col-span-8"
                      : "lg:col-span-4"
            }`}
          >
            <div className="h-4 w-40 rounded bg-slate-800" />
            <div className="mt-6 h-32 rounded-lg bg-slate-800/80" />
          </div>
        ))}
      </div>
    </div>
  );
}
