import React from "react";
import {
  HEADER,
  STAT_CARD,
  STATS_GRID,
  ICON_WRAPPER,
} from "../../../assets/dummy";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse select-none">
      {/* 1. HEADER SKELETON */}
      <div className={HEADER}>
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="h-6 md:h-7 w-40 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="h-4 w-56 ml-7 rounded bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
      </div>

      {/* 2. STATS KPI GRID SKELETON */}
      <div className={STATS_GRID}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`${STAT_CARD} border-slate-200 dark:border-slate-800 dark:bg-gray-900/60 backdrop-blur-sm`}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`${ICON_WRAPPER} bg-slate-100 dark:bg-slate-800`}>
                <div className="w-4 h-4 md:w-5 md:h-5 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-3 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-5 w-10 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. FILTERS BAR SKELETON */}
      <div className="p-3 sm:p-4 rounded-xl border border-sky-100 dark:border-gray-800 bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          {/* Search box placeholder */}
          <div className="h-[38px] w-full sm:w-64 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60" />
          {/* Dropdown placeholders */}
          <div className="h-[38px] w-28 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60" />
          <div className="h-[38px] w-28 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60" />
          <div className="h-[38px] w-28 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60" />
          <div className="h-[38px] w-28 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60" />
        </div>
        {/* View Mode switcher placeholder */}
        <div className="h-[38px] w-28 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shrink-0 self-end md:self-auto" />
      </div>

      {/* 4. FOUR KANBAN COLUMNS SKELETON */}
      <div
        style={{ gridTemplateColumns: `repeat(4, minmax(0, 1fr))` }}
        className="flex flex-row overflow-x-auto gap-4 lg:gap-5 pt-2 pb-4 md:grid md:items-start select-none max-w-full -mx-3.5 px-3.5 sm:mx-0 sm:px-0"
      >
        {["To Do", "In Progress", "Done", "Reopen"].map((col) => (
          <div
            key={col}
            className="border border-sky-100 dark:border-gray-800 rounded-xl p-3.5 sm:p-4 flex flex-col min-h-[480px] w-[85vw] min-w-[270px] max-w-[340px] md:max-w-none md:w-full shrink-0 shadow-sm bg-gray-50/70 dark:bg-gray-900/50"
          >
            {/* Column Header Skeleton */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-sky-100/50 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-6 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>

            {/* Column Cards Skeleton */}
            <div className="space-y-3 flex-1">
              {[1, 2, 3].map((cardIdx) => (
                <div
                  key={cardIdx}
                  className="bg-white dark:bg-gray-950 border border-sky-100 dark:border-gray-800 rounded-lg p-3.5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3.5 w-3.5 rounded bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-full rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3.5 w-4/5 rounded bg-slate-100 dark:bg-slate-800/70" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-14 rounded bg-slate-100 dark:bg-slate-800" />
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
