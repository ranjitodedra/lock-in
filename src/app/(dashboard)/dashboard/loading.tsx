export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
        <div className="h-8 min-w-[200px] flex-1 animate-pulse rounded-lg bg-muted" />
        <div className="h-8 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="h-8 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="space-y-0 border-b border-border p-3">
          <div className="flex gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-4 w-20 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, row) => (
          <div
            key={row}
            className="flex gap-4 border-b border-border p-3 last:border-0"
          >
            {Array.from({ length: 7 }).map((_, col) => (
              <div
                key={col}
                className="h-4 w-full max-w-[120px] animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
