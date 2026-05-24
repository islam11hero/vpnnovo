export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-800/40 opacity-20" />
      <div className="h-32 w-full animate-pulse rounded-xl bg-slate-800/40 opacity-20" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-slate-800/40 opacity-20"
          />
        ))}
      </div>
    </div>
  );
}
