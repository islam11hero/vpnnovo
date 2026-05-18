export function AdminKpiSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm"
        >
          <div className="mb-4 h-4 w-24 rounded-lg bg-slate-200" />
          <div className="h-9 w-20 rounded-lg bg-slate-200" />
          <div className="mt-6 flex justify-end">
            <div className="h-14 w-14 rounded-full bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
