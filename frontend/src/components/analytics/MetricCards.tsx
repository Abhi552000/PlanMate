import React from "react";
import { Calendar, CheckCircle2, Award, HelpCircle } from "lucide-react";
import { MetricCardsProps } from "../../types";

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Remaining Points Card */}
      <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-505 rounded-xl">
              <Calendar className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">To Do</h4>
              <p className="text-2xl font-black text-gray-855 dark:text-gray-100 mt-0.5">
                {metrics.pendingCount} {metrics.pendingCount === 1 ? "Task" : "Tasks"}
              </p>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-semibold">
          {metrics.remainingPoints} story points left estimate.
        </p>
      </div>

      {/* Done Card */}
      <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-505 rounded-xl">
              <CheckCircle2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Done</h4>
              <p className="text-2xl font-black text-gray-855 dark:text-gray-100 mt-0.5">
                {metrics.completedCount} {metrics.completedCount === 1 ? "Task" : "Tasks"}
              </p>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-semibold">
          {metrics.completedPoints} story points resolved.
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 dark:bg-sky-955/20 text-sky-505 rounded-xl">
              <Award className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Progress</h4>
              <p className="text-2xl font-black text-gray-855 dark:text-gray-100 mt-0.5">
                {metrics.completionRate}% Done
              </p>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-semibold">
          {metrics.completedCount} / {metrics.totalCount} tasks completed.
        </p>
      </div>
    </div>
  );
};
