import React, { useMemo, useState } from "react";
import { ITask, AnalyticsDashboardProps } from "../types";
import { HelpCircle, Info, AlertCircle, Flag, UserX, Briefcase, TrendingUp, ArrowUpRight } from "lucide-react";
import { MetricCards } from "./analytics/MetricCards";
import { ChartsSection } from "./analytics/ChartsSection";
import {
  getWeeklyData,
  getBurndownData,
  getInsights,
} from "./analytics/helpers";

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  tasks,
  onApplyFilters,
}) => {

  // 1. Calculate General Metrics from Filtered Tasks
  const metrics = useMemo(() => {
    const totalCount = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Done");
    const completedCount = completedTasks.length;
    const pendingCount = totalCount - completedCount;

    const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedPoints = completedTasks.reduce(
      (sum, t) => sum + (t.storyPoints || 0),
      0
    );
    const remainingPoints = totalPoints - completedPoints;

    const getLocalYYYYMMDD = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const todayStr = getLocalYYYYMMDD(new Date());

    const overdueCount = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const dueStr =
        typeof t.dueDate === "string"
          ? t.dueDate.split("T")[0]
          : getLocalYYYYMMDD(new Date(t.dueDate));
      const isCompleted = t.status === "Done";
      return dueStr < todayStr && !isCompleted;
    }).length;

    const completionRate =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      completedCount,
      pendingCount,
      totalPoints,
      completedPoints,
      remainingPoints,
      overdueCount,
      completionRate,
    };
  }, [tasks]);

  // 2. Map Week labels to human-friendly terms and compute velocity
  const weeklyData = useMemo(() => getWeeklyData(tasks), [tasks]);

  // 3. Dynamic Daily workload trend curve calculation
  const burndownData = useMemo(
    () => getBurndownData(tasks, metrics.totalPoints),
    [tasks, metrics.totalPoints]
  );

  // 4. Priority breakdown calculation
  const priorityBreakdown = useMemo(() => {
    const breakdown = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach((t) => {
      if (t.priority && breakdown[t.priority] !== undefined) {
        breakdown[t.priority] += 1;
      }
    });

    return [
      { name: "Urgent / High", value: breakdown.High, color: "#ef4444" },
      { name: "Medium Priority", value: breakdown.Medium, color: "#f59e0b" },
      { name: "Low Priority", value: breakdown.Low, color: "#10b981" },
    ].filter((p) => p.value > 0);
  }, [tasks]);

  // 5. Intelligent Workspace Insights Recommendations
  const insights = useMemo(() => getInsights(tasks, metrics), [tasks, metrics]);

  // Clean Markdown formatter helper for suggestions list
  const formatInsightText = (text: string) => {
    return text.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-extrabold text-gray-800 dark:text-gray-100">$1</strong>'
    );
  };

  // Basic Icon mapper
  const renderInsightIcon = (type: string) => {
    switch (type) {
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />;
      case "highPriority":
        return <Flag className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />;
      case "unassigned":
        return <UserX className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />;
      case "workload":
        return <Briefcase className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />;
      default:
        return <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center p-12 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl space-y-3">
        <p className="text-gray-400 font-semibold text-sm">
          No tasks match your selected filters.
        </p>
        <p className="text-gray-400 text-xs">
          Try clearing your filters or search terms to generate workspace
          metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans pb-10">
      {/* Title Header */}
      <div className="border-b border-sky-50 dark:border-gray-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-850 dark:text-gray-200">
            Interactive Analytics
          </h2>
          <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">
            Analyzing {metrics.totalCount} active tasks matching your current
            dashboard filters.
          </p>
        </div>
        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 dark:bg-sky-955/20 px-2.5 py-1 rounded-full border border-sky-100 dark:border-gray-800 self-start sm:self-auto">
          ⚡ Updates automatically with filters
        </span>
      </div>

      {/* Visual Analytics Header Cards */}
      <MetricCards
        metrics={metrics}
      />

      {/* Dynamic Smart Observations */}
      <div className="bg-sky-50/10 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 p-5 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 border-b border-sky-100/50 dark:border-gray-800/80 pb-2.5">
          <Info className="w-4 h-4 text-gray-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Workspace Insights
          </h3>
        </div>
        <ul className="space-y-3.5 pt-1">
          {insights.map((insight, idx) => (
            <li
              key={idx}
              onClick={() => onApplyFilters?.(insight.filters)}
              className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-350 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors group py-0.5"
            >
              <div className="flex items-start gap-3 leading-relaxed">
                {renderInsightIcon(insight.type)}
                <span
                  dangerouslySetInnerHTML={{ __html: formatInsightText(insight.text) }}
                />
              </div>
              {insight.type !== "progress" && (
                <ArrowUpRight className="w-3.5 h-3.5 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Charts Section */}
      <ChartsSection
        burndownData={burndownData}
        priorityBreakdown={priorityBreakdown}
        metrics={metrics}
        weeklyData={weeklyData}
        tasks={tasks}
      />
    </div>
  );
};
