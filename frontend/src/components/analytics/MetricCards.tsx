import React from "react";
import { Calendar, CheckCircle2, Award, HelpCircle } from "lucide-react";
import { MetricCardsProps } from "../../types";

export const MetricCards: React.FC<MetricCardsProps> = ({
  metrics,
  activeTooltip,
  setActiveTooltip,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Remaining Points Card */}
      <div className="relative bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-505 rounded-xl">
              <Calendar className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">To Do</h4>
              <p className="text-2xl font-black text-gray-805 dark:text-gray-100 mt-0.5">
                {metrics.pendingCount} {metrics.pendingCount === 1 ? "Task" : "Tasks"}
              </p>
            </div>
          </div>
          <button
            onMouseEnter={() => setActiveTooltip("pending")}
            onMouseLeave={() => setActiveTooltip(null)}
            type="button"
            className="text-gray-405 hover:text-gray-600 transition-colors p-1"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
        </div>
        {activeTooltip === "pending" && (
          <div className="absolute right-4 bottom-14 z-20 bg-gray-950 text-white text-[10px] p-2.5 rounded-lg shadow-lg max-w-[200px] border border-gray-800 leading-normal">
            Tasks remaining to be resolved. (Estimated weight: {metrics.remainingPoints} story points).
          </div>
        )}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-semibold">
          {metrics.remainingPoints} story points left estimate.
        </p>
      </div>

      {/* Done Card */}
      <div className="relative bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-505 rounded-xl">
              <CheckCircle2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Done</h4>
              <p className="text-2xl font-black text-gray-805 dark:text-gray-100 mt-0.5">
                {metrics.completedCount} {metrics.completedCount === 1 ? "Task" : "Tasks"}
              </p>
            </div>
          </div>
          <button
            onMouseEnter={() => setActiveTooltip("completed")}
            onMouseLeave={() => setActiveTooltip(null)}
            type="button"
            className="text-gray-405 hover:text-gray-600 transition-colors p-1"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
        </div>
        {activeTooltip === "completed" && (
          <div className="absolute right-4 bottom-14 z-20 bg-gray-950 text-white text-[10px] p-2.5 rounded-lg shadow-lg max-w-[200px] border border-gray-800 leading-normal">
            Tasks fully finished and closed. (Resolved weight: {metrics.completedPoints} story points).
          </div>
        )}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-semibold">
          {metrics.completedPoints} story points resolved.
        </p>
      </div>

      {/* Progress Card */}
      <div className="relative bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-50 dark:bg-sky-950/20 text-sky-505 rounded-xl">
              <Award className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Progress</h4>
              <p className="text-2xl font-black text-gray-805 dark:text-gray-100 mt-0.5">
                {metrics.completionRate}% Done
              </p>
            </div>
          </div>
          <button
            onMouseEnter={() => setActiveTooltip("progress")}
            onMouseLeave={() => setActiveTooltip(null)}
            type="button"
            className="text-gray-405 hover:text-gray-600 transition-colors p-1"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
        </div>
        {activeTooltip === "progress" && (
          <div className="absolute right-4 bottom-14 z-20 bg-gray-950 text-white text-[10px] p-2.5 rounded-lg shadow-lg max-w-[200px] border border-gray-800 leading-normal">
            The percentage of matching tasks fully completed.
          </div>
        )}
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 font-semibold">
          {metrics.completedCount} / {metrics.totalCount} tasks completed.
        </p>
      </div>
    </div>
  );
};
