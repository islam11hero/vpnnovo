export function ClientsTelemetrySkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 w-full animate-pulse rounded-xl bg-slate-800/40 opacity-20"
          />
        ))}
      </div>
      <div className="h-32 w-full animate-pulse rounded-xl bg-slate-800/40 opacity-20" />
    </div>
  );
}
