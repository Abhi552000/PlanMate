import React from "react";

export const ActiveSprintSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6 font-sans animate-pulse select-none">
      {/* Active Sprint Header Info Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-6 w-44 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="h-3.5 w-60 rounded bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="h-9 w-36 rounded-xl bg-slate-200 dark:bg-slate-800 self-start sm:self-auto" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-wrap items-center gap-2.5 pb-2">
        <div className="h-8 w-32 rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-8 w-32 rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-8 w-36 rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>

      {/* Scrum Board Columns Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-start">
        {[1, 2, 3].map((col) => (
          <div
            key={col}
            className="flex flex-col bg-slate-50 dark:bg-gray-900/60 border border-slate-200/80 dark:border-gray-800 rounded-2xl p-3.5 space-y-3"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
              <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Task Cards */}
            <div className="space-y-2.5">
              {[1, 2].map((card) => (
                <div
                  key={card}
                  className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl p-3.5 shadow-2xs space-y-3"
                >
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800/60" />
                  <div className="flex items-center justify-between pt-1">
                    <div className="h-4 w-14 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
