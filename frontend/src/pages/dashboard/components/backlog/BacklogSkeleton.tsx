import React from "react";

export const BacklogSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6 font-sans animate-pulse select-none">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-3.5 w-72 rounded bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="h-9 w-36 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Epic Filters Skeleton */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-3 border-b border-sky-100/50 dark:border-gray-800">
        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800 mr-2" />
        <div className="h-7 w-16 rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-7 w-24 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
        <div className="h-7 w-28 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
      </div>

      {/* Sprint Accordions Skeleton */}
      <div className="w-full space-y-5">
        {/* Sprint 1 */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-gray-800/60">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-1.5">
                <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-48 rounded bg-slate-100 dark:bg-slate-800/60" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="h-6 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
              <div className="h-8 w-24 rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="p-3 sm:p-4 space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-slate-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-52 sm:w-80 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backlog Issues Container Skeleton */}
        <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-gray-800/60">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-36 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-6 w-20 rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="p-3 sm:p-4 space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-gray-800/40 rounded-xl border border-slate-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-44 sm:w-72 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
