import React from "react";

export const TaskModalSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-12 animate-pulse py-2">
      {/* Left side skeleton */}
      <div className="md:col-span-7 space-y-5">
        {/* Summary Skeleton */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-24 bg-slate-200 dark:bg-gray-700 rounded" />
          <div className="h-[38px] w-full bg-slate-100 dark:bg-gray-800 rounded-lg border border-slate-200/60 dark:border-gray-700/60" />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 bg-slate-200 dark:bg-gray-700 rounded" />
          <div className="h-[120px] w-full bg-slate-100 dark:bg-gray-800 rounded-lg border border-slate-200/60 dark:border-gray-700/60" />
        </div>

        {/* Subtasks Checklist Skeleton */}
        <div className="space-y-2 pt-1">
          <div className="h-3.5 w-36 bg-slate-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-full bg-slate-50 dark:bg-gray-850 rounded-lg border border-slate-200/40 dark:border-gray-800" />
          <div className="flex gap-2 mt-2">
            <div className="flex-1 h-[38px] bg-slate-100 dark:bg-gray-800 rounded-lg border border-slate-200/60 dark:border-gray-700/60" />
            <div className="w-16 h-[38px] bg-slate-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Right side Jira metadata layout Skeleton */}
      <div className="md:col-span-5 space-y-3.5 bg-slate-50/60 dark:bg-gray-900/40 p-4 rounded-xl border border-slate-200/80 dark:border-gray-800/80 self-start">
        {/* Status */}
        <div className="space-y-1.5">
          <div className="h-3 w-16 bg-slate-200 dark:bg-gray-700 rounded" />
          <div className="h-[38px] w-full bg-slate-100 dark:bg-gray-800 rounded-lg" />
        </div>

        {/* Issue Type */}
        <div className="space-y-1.5">
          <div className="h-3 w-20 bg-slate-200 dark:bg-gray-700 rounded" />
          <div className="h-[38px] w-full bg-slate-100 dark:bg-gray-800 rounded-lg" />
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <div className="h-3 w-16 bg-slate-200 dark:bg-gray-700 rounded" />
          <div className="h-[38px] w-full bg-slate-100 dark:bg-gray-800 rounded-lg" />
        </div>

        {/* Assignee */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 bg-slate-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-20 bg-slate-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-[38px] w-full bg-slate-100 dark:bg-gray-800 rounded-lg" />
        </div>

        {/* Due Date */}
        <div className="space-y-1.5">
          <div className="h-3 w-18 bg-slate-200 dark:bg-gray-700 rounded" />
          <div className="h-[38px] w-full bg-slate-100 dark:bg-gray-800 rounded-lg" />
        </div>

        {/* Story Points & Estimate */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <div className="h-3 w-16 bg-slate-200 dark:bg-gray-700 rounded" />
            <div className="h-[38px] w-full bg-slate-100 dark:bg-gray-800 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-16 bg-slate-200 dark:bg-gray-700 rounded" />
            <div className="h-[38px] w-full bg-slate-100 dark:bg-gray-800 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};
