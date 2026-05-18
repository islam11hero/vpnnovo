export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 shadow-sm backdrop-blur-sm">
      <div className="border-b border-slate-200/60 bg-slate-50/80 p-6">
        <div className="h-6 w-48 animate-pulse rounded-lg bg-slate-200" />
      </div>
      <div className="divide-y divide-slate-100 p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-4 p-4">
            <div className="h-3 w-3 rounded-full bg-slate-200" />
            <div className="h-4 flex-1 max-w-[140px] rounded bg-slate-200" />
            <div className="h-3 flex-1 max-w-[200px] rounded-full bg-slate-100" />
            <div className="h-6 w-16 rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
