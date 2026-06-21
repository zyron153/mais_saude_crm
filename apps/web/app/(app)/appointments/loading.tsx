export default function AppointmentsLoading() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-6 w-44 bg-dim-200 rounded-[8px]" />
          <div className="h-3.5 w-56 bg-dim-100 rounded-[6px]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-36 bg-dim-100 rounded-[10px]" />
          <div className="h-9 w-36 bg-dim-200 rounded-[10px]" />
        </div>
      </div>

      {/* Stats pills + legend row */}
      <div className="flex items-center gap-3">
        {[80, 88, 96, 88].map((w, i) => (
          <div key={i} className="h-7 bg-dim-100 rounded-[10px]" style={{ width: w }} />
        ))}
        <div className="ml-auto flex items-center gap-2">
          {[60, 68, 56, 60, 52, 56].map((w, i) => (
            <div key={i} className="h-5 bg-dim-100 rounded-full" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* Calendar card */}
      <div className="bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08)] overflow-hidden">
        {/* FullCalendar toolbar */}
        <div className="p-4 border-b border-dim-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-dim-100 rounded-[6px]" />
            <div className="h-7 w-7 bg-dim-100 rounded-[6px]" />
            <div className="h-7 w-14 bg-dim-100 rounded-[6px]" />
          </div>
          <div className="h-5 w-44 bg-dim-200 rounded-[6px]" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-14 bg-dim-100 rounded-[6px]" />
            <div className="h-7 w-20 bg-dim-100 rounded-[6px]" />
            <div className="h-7 w-12 bg-dim-100 rounded-[6px]" />
          </div>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-dim-100">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="px-2 py-2.5 flex justify-center">
              <div className="h-3 w-8 bg-dim-100 rounded" />
            </div>
          ))}
        </div>

        {/* Calendar cells — 5 weeks × 7 days */}
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="grid grid-cols-7 border-b border-dim-50 last:border-0">
            {Array.from({ length: 7 }).map((_, col) => (
              <div key={col} className="min-h-[96px] p-2 border-r border-dim-50 last:border-0">
                <div className="h-5 w-5 bg-dim-100 rounded-full mb-2" />
                {/* Simulate a few appointment events scattered across weeks */}
                {(row * 7 + col) % 5 === 1 && (
                  <div className="h-5 bg-dim-100 rounded mb-1" />
                )}
                {(row * 7 + col) % 7 === 3 && (
                  <div className="h-5 bg-dim-100 rounded mb-1" />
                )}
                {(row * 7 + col) % 11 === 5 && (
                  <div className="h-5 bg-dim-100 rounded" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
