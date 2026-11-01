import React from "react";
import { Calendar, CheckCircle2, Award } from "lucide-react";
import { MetricCardsProps } from "../../types";

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
      {/* To Do (Remaining Points Card) */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-2xs hover:shadow-sm transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100/80 dark:border-rose-900/40 rounded-xl shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                To Do
              </h4>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {metrics.pendingCount}{" "}
                <span className="text-xs font-semibold text-slate-400">
                  {metrics.pendingCount === 1 ? "task" : "tasks"}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Estimated Workload</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {metrics.remainingPoints} SP left
          </span>
        </div>
      </div>

      {/* Done Card */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-2xs hover:shadow-sm transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/80 dark:border-emerald-900/40 rounded-xl shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Done
              </h4>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {metrics.completedCount}{" "}
                <span className="text-xs font-semibold text-slate-400">
                  {metrics.completedCount === 1 ? "task" : "tasks"}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Delivered Points</span>
          <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 px-2 py-0.5 rounded-md">
            {metrics.completedPoints} SP done
          </span>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-2xs hover:shadow-sm transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border border-sky-100/80 dark:border-sky-900/40 rounded-xl shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Progress
              </h4>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                {metrics.completionRate}%
              </p>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.completionRate)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            <span>{metrics.completedCount} of {metrics.totalCount} completed</span>
            <span>{metrics.completionRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
