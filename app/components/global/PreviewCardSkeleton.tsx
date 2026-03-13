import React from "react";

const PreviewCardSkeleton = () => {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 md:p-6">
      <div className="relative w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] flex flex-col md:flex-row bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden animate-pulse">
        {/* --- KIRI: Image Area Skeleton --- */}
        <div className="w-full md:w-95 p-6 md:p-8 bg-slate-950/40 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
          <div className="relative w-full max-w-62.5 md:max-w-full aspect-3/4 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl">
            {/* Animasi Shimmer Efek */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-slate-700/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
          <div className="mt-4 w-20 h-3 bg-slate-800 rounded hidden md:block"></div>
        </div>

        {/* --- KANAN: Content Area Skeleton --- */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Skeleton */}
          <div className="p-5 md:p-6 border-b border-slate-800 bg-slate-900/50 space-y-3">
            <div className="h-8 w-3/4 bg-slate-800 rounded-lg"></div>
            <div className="h-4 w-24 bg-slate-800 rounded"></div>
          </div>

          {/* Details Skeleton */}
          <div className="flex-1 p-5 md:p-8 space-y-8 overflow-hidden">
            {/* Grid Stats Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-2"
                >
                  <div className="h-2 w-10 bg-slate-800 rounded"></div>
                  <div className="h-6 w-14 bg-slate-800 rounded"></div>
                </div>
              ))}
            </div>

            {/* Tags Skeleton */}
            <div className="flex gap-10">
              <div className="space-y-3">
                <div className="h-2 w-12 bg-slate-800 rounded"></div>
                <div className="h-8 w-20 bg-slate-800 rounded-md"></div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-12 bg-slate-800 rounded"></div>
                <div className="flex gap-2">
                  <div className="h-8 w-24 bg-slate-800 rounded-md"></div>
                  <div className="h-8 w-24 bg-slate-800 rounded-md"></div>
                </div>
              </div>
            </div>

            {/* Effect Section Skeleton */}
            <div className="space-y-3">
              <div className="h-3 w-28 bg-slate-800 rounded"></div>
              <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800/50 space-y-3">
                <div className="h-4 w-full bg-slate-800 rounded"></div>
                <div className="h-4 w-full bg-slate-800 rounded"></div>
                <div className="h-4 w-2/3 bg-slate-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewCardSkeleton;
