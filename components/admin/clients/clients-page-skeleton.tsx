export function ClientsPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 backdrop-blur-md"
          >
            <div className="h-3 w-28 rounded bg-slate-800" />
            <div className="mt-4 h-9 w-16 rounded bg-slate-800" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-6 backdrop-blur-md">
        <div className="mb-6 h-4 w-48 rounded bg-slate-800" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="mb-3 h-12 rounded-lg bg-slate-900/80" />
        ))}
      </div>
    </div>
  );
}
