export default function PatientsLoading() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-40 bg-dim-200 rounded-[8px]" />
          <div className="h-3.5 w-52 bg-dim-100 rounded-[6px]" />
        </div>
        <div className="h-9 w-36 bg-dim-200 rounded-[10px]" />
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-10 bg-white rounded-[10px] border border-dim-200 shadow-[0_1px_2px_rgba(0,0,0,.05)]" />
        <div className="h-10 w-28 bg-dim-100 rounded-[10px]" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-dim-100 flex items-center justify-between">
          <div className="h-4 w-32 bg-dim-200 rounded-[6px]" />
          <div className="h-4 w-16 bg-dim-100 rounded-[6px]" />
        </div>
        <div className="divide-y divide-dim-100">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5 flex items-center gap-4">
              <div className="w-8 h-8 bg-dim-100 rounded-full shrink-0" />
              <div className="h-3 bg-dim-100 rounded-[6px]" style={{ width: 120 + (i * 23) % 100 }} />
              <div className="h-3 w-24 bg-dim-100 rounded-[6px]" />
              <div className="h-3 w-36 bg-dim-100 rounded-[6px]" />
              <div className="h-5 w-24 bg-dim-100 rounded-full ml-auto" />
              <div className="h-3 w-14 bg-dim-100 rounded-[6px]" />
            </div>
          ))}
        </div>
        {/* Pagination skeleton */}
        <div className="px-5 py-3 border-t border-dim-100 flex items-center justify-between">
          <div className="h-3 w-32 bg-dim-100 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-dim-100 rounded-[6px]" />
            <div className="h-7 w-7 bg-dim-100 rounded-[6px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
