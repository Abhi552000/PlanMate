import React, { useMemo } from "react";
import { ITask, AnalyticsDashboardProps } from "../types";
import { Info, AlertCircle, Flag, UserX, Briefcase, TrendingUp, ArrowUpRight, BarChart2 } from "lucide-react";
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
    const completedTasks = tasks.filter((t) => t.status === "Done" || t.completed === true || t.completed === "Yes");
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
      const isCompleted = t.status === "Done" || t.completed === true || t.completed === "Yes";
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
      { name: "Urgent / High", value: breakdown.High, color: "#f43f5e" },
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
      '<strong class="font-bold text-slate-800 dark:text-slate-100">$1</strong>'
    );
  };

  // Basic Icon mapper
  const renderInsightIcon = (type: string) => {
    switch (type) {
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />;
      case "highPriority":
        return <Flag className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />;
      case "unassigned":
        return <UserX className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />;
      case "workload":
        return <Briefcase className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />;
      default:
        return <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center p-12 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl space-y-3 shadow-2xs">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-500 flex items-center justify-center mx-auto">
          <BarChart2 className="w-6 h-6" />
        </div>
        <p className="text-slate-800 dark:text-slate-200 font-bold text-sm">
          No tasks match your selected filters.
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-xs max-w-sm mx-auto">
          Try clearing your filters, changing timeframes, or resetting search terms to generate workspace analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans pb-10">
      {/* Title Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Sprint & Workload Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Analyzing {metrics.totalCount} active tasks across your current filters.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-3 py-1 rounded-full border border-sky-200/70 dark:border-sky-800/60 self-start sm:self-auto flex items-center gap-1.5 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          Live Filter Synced
        </span>
      </div>

      {/* Visual Analytics Header Cards */}
      <MetricCards metrics={metrics} />

      {/* Dynamic Smart Observations */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/70 pb-3">
          <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
            <Info className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Workspace Insights & Actionable Bottlenecks
          </h3>
        </div>
        <ul className="space-y-2.5 pt-1">
          {insights.map((insight, idx) => (
            <li
              key={idx}
              onClick={() => onApplyFilters?.(insight.filters)}
              className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-350 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors group p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-start gap-3 leading-relaxed">
                {renderInsightIcon(insight.type)}
                <span
                  dangerouslySetInnerHTML={{ __html: formatInsightText(insight.text) }}
                />
              </div>
              {insight.type !== "progress" && (
                <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  <span>Filter view</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
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
