export default function DashboardLoading() {
  return (
    <div className="space-y-6 w-full animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 bg-slate-200 rounded-lg" />
          <div className="h-9 w-32 bg-slate-200 rounded-lg" />
        </div>
      </div>

      {/* Net Worth Strip Skeleton */}
      <div className="h-24 w-full rounded-xl bg-gradient-to-r from-teal-800/40 via-teal-700/30 to-teal-800/40 border border-teal-700/20 p-5 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-28 bg-teal-600/30 rounded" />
          <div className="h-7 w-44 bg-teal-500/30 rounded" />
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <div className="h-8 w-28 bg-teal-600/20 rounded-lg" />
          <div className="h-8 w-32 bg-teal-600/20 rounded-lg" />
        </div>
      </div>

      {/* 4 KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#E2E8F0] p-4.5 space-y-3 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-slate-200 rounded" />
              <div className="size-8 rounded-lg bg-slate-100" />
            </div>
            <div className="h-8 w-36 bg-slate-200 rounded" />
            <div className="h-3 w-28 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main Grid: Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="h-4 w-36 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-100 rounded" />
            </div>
            <div className="h-44 w-full bg-slate-100 rounded-lg" />
          </div>

          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-3 shadow-2xs">
            <div className="h-4 w-40 bg-slate-200 rounded mb-4" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-slate-100" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 bg-slate-200 rounded" />
                    <div className="h-2.5 w-16 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 span) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 space-y-4 shadow-2xs">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-24 bg-slate-200 rounded" />
                    <div className="h-3.5 w-16 bg-slate-200 rounded" />
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
