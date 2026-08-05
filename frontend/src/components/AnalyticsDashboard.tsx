import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ITask } from "../types";
import { CheckCircle2, Award, Calendar, HelpCircle, BarChart3, PieChartIcon, TrendingUp, Sparkles } from "lucide-react";

interface AnalyticsDashboardProps {
  tasks: ITask[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tasks }) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // 1. Calculate General Metrics from Filtered Tasks
  const metrics = useMemo(() => {
    const totalCount = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "Done");
    const completedCount = completedTasks.length;
    const pendingCount = totalCount - completedCount;

    const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedPoints = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const remainingPoints = totalPoints - completedPoints;

    const overdueCount = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Done"
    ).length;

    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
  const weeklyData = useMemo(() => {
    const weeksData = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const end = new Date();
      end.setDate(now.getDate() - i * 7);
      end.setHours(23, 59, 59, 999);

      const start = new Date();
      start.setDate(now.getDate() - (i + 1) * 7);
      start.setHours(0, 0, 0, 0);

      let weekPoints = 0;
      let weekCount = 0;

      tasks.forEach((t) => {
        if (t.status === "Done") {
          let completionDate = t.updatedAt || t.createdAt || new Date();
          if (t.history && Array.isArray(t.history)) {
            const statusHistory = t.history.filter((h) => h.field === "status" && h.newValue === "Done");
            if (statusHistory.length > 0) {
              completionDate = statusHistory[statusHistory.length - 1].updatedAt;
            }
          }

          const cTime = new Date(completionDate).getTime();
          if (cTime >= start.getTime() && cTime <= end.getTime()) {
            weekPoints += t.storyPoints || 0;
            weekCount += 1;
          }
        }
      });

      let label = "";
      if (i === 0) label = "This Week";
      else if (i === 1) label = "Last Week";
      else if (i === 2) label = "2 Weeks Ago";
      else label = "3 Weeks Ago";

      weeksData.push({
        Week: label,
        "Points Earned": weekPoints,
        "Tasks Completed": weekCount,
      });
    }
    return weeksData;
  }, [tasks]);

  // 3. Dynamic Daily workload trend curve calculation
  const burndownData = useMemo(() => {
    const trend = [];
    const totalStoryPoints = metrics.totalPoints;

    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      let resolvedBeforeDay = 0;
      tasks.forEach((t) => {
        if (t.status === "Done") {
          let completionDate = t.updatedAt || t.createdAt || new Date();
          if (t.history && Array.isArray(t.history)) {
            const statusHistory = t.history.filter((h) => h.field === "status" && h.newValue === "Done");
            if (statusHistory.length > 0) {
              completionDate = statusHistory[statusHistory.length - 1].updatedAt;
            }
          }
          if (new Date(completionDate) <= dayEnd) {
            resolvedBeforeDay += t.storyPoints || 0;
          }
        }
      });

      trend.push({
        day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        "Remaining Points": Math.max(0, totalStoryPoints - resolvedBeforeDay),
        "Ideal Burn Target": Math.max(0, Math.round(totalStoryPoints - (totalStoryPoints / 14) * (14 - i))),
      });
    }
    return trend;
  }, [tasks, metrics.totalPoints]);

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
  const insights = useMemo(() => {
    const list: string[] = [];

    // Overdue tasks
    if (metrics.overdueCount > 0) {
      list.push(
        `⚠️ **${metrics.overdueCount} task${metrics.overdueCount > 1 ? "s are" : " is"} overdue** and past deadline. Let's adjust dates or solve these next.`
      );
    }

    // High priority tasks
    const activeHigh = tasks.filter((t) => t.priority === "High" && t.status !== "Done").length;
    if (activeHigh > 0) {
      list.push(
        `🔥 **${activeHigh} high-priority tasks** are still in progress. We recommend focusing on these first.`
      );
    }

    // Unassigned tasks
    const activeUnassigned = tasks.filter((t) => !t.assignee && t.status !== "Done").length;
    if (activeUnassigned > 0) {
      list.push(
        `👤 **${activeUnassigned} active tasks** have no assignee. Assigning owners helps get things done.`
      );
    }

    // Heavy workload bottleneck identification
    const userWorkload: { [name: string]: number } = {};
    tasks.forEach((t) => {
      if (t.status !== "Done") {
        const name = t.assignee?.name || (typeof t.assignee === "object" ? t.assignee?.name : null);
        if (name) {
          userWorkload[name] = (userWorkload[name] || 0) + (t.storyPoints || 0);
        }
      }
    });

    let highestUser = "";
    let highestPoints = 0;
    Object.keys(userWorkload).forEach((uName) => {
      if (userWorkload[uName] > highestPoints) {
        highestPoints = userWorkload[uName];
        highestUser = uName;
      }
    });

    if (highestUser && highestPoints >= 8) {
      list.push(
        `💼 **${highestUser}** has a heavy workload with **${highestPoints} story points**. Consider delegating tasks.`
      );
    }

    // Completion percentage comments
    if (metrics.totalCount > 0) {
      if (metrics.completionRate === 100) {
        list.push(
          "🎉 **Awesome!** All tasks are completed under these filters."
        );
      } else if (metrics.completionRate >= 75) {
        list.push(
          `🚀 **Almost there!** You've completed **${metrics.completionRate}%** of tasks. Just **${metrics.pendingCount} left**!`
        );
      } else if (metrics.completionRate > 0) {
        list.push(
          `📈 Progress is at **${metrics.completionRate}%** (${metrics.completedCount} out of ${metrics.totalCount} tasks completed).`
        );
      }
    }

    if (list.length === 0) {
      list.push("💡 Filters show no active tasks. Try clearing search or filters to see metrics.");
    }

    return list;
  }, [tasks, metrics]);

  // Clean Markdown formatter helper for suggestions list
  const formatInsightText = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-gray-800 dark:text-gray-100">$1</strong>');
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center p-12 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl space-y-3">
        <p className="text-gray-400 font-semibold text-sm">No tasks match your selected filters.</p>
        <p className="text-gray-400 text-xs">
          Try clearing your filters or search terms to generate workspace metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full font-sans pb-10">
      {/* Title Header */}
      <div className="border-b border-sky-50 dark:border-gray-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-850 dark:text-gray-200">Interactive Analytics</h2>
          <p className="text-xs text-gray-500 dark:text-gray-405 mt-1">
            Analyzing {metrics.totalCount} active tasks matching your current dashboard filters.
          </p>
        </div>
        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 dark:bg-sky-955/20 px-2.5 py-1 rounded-full border border-sky-100 dark:border-gray-800 self-start sm:self-auto">
          ⚡ Updates automatically with filters
        </span>
      </div>

      {/* Visual Analytics Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Remaining Points Card */}
        <div className="relative bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl">
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
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
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
              <div className="p-3 bg-sky-50 dark:bg-sky-950/20 text-sky-500 rounded-xl">
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

      {/* Dynamic Smart Observations */}
      <div className="bg-gradient-to-r from-sky-50/50 to-indigo-50/20 dark:from-sky-950/10 dark:to-gray-900 border border-sky-100 dark:border-gray-800 p-5 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 border-b border-sky-100/50 dark:border-gray-800/80 pb-2">
          <Sparkles className="w-4.5 h-4.5 text-sky-500" />
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Workspace Insights
          </h3>
        </div>
        <ul className="space-y-2 text-xs text-gray-650 dark:text-gray-300">
          {insights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-sky-500 mt-0.5 font-bold">•</span>
              <span dangerouslySetInnerHTML={{ __html: formatInsightText(insight) }} />
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress Timeline Trend */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-50 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250">Remaining Workload Trend</h3>
            </div>
            <span className="text-[10px] font-bold text-gray-405 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded border border-sky-100/50 dark:border-gray-700">
              Last 15 Days
            </span>
          </div>

          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burndownData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="hidden dark:block" />
                <XAxis dataKey="day" stroke="#9ca3af" tickLine={false} />
                <YAxis stroke="#9ca3af" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(224,242,254,0.8)",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                  itemStyle={{ fontSize: "11px", fontWeight: "bold" }}
                  labelStyle={{ fontWeight: "extrabold", color: "#374151", marginBottom: "4px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: "semibold", paddingTop: "10px" }} />
                <Area
                  type="monotone"
                  dataKey="Remaining Points"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRemaining)"
                />
                <Area
                  type="monotone"
                  dataKey="Ideal Burn Target"
                  stroke="#9ca3af"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (Pie Chart) */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 border-b border-sky-50 dark:border-gray-800 pb-3">
            <PieChartIcon className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250">Tasks by Priority</h3>
          </div>

          {priorityBreakdown.length > 0 ? (
            <div className="space-y-4">
              <div className="h-44 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {priorityBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid rgba(224,242,254,0.8)",
                        fontSize: "11px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Total task label in center of donut */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-gray-805 dark:text-gray-100">{metrics.totalCount}</span>
                  <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Total</span>
                </div>
              </div>

              {/* Priority list details */}
              <div className="space-y-2 pt-2">
                {priorityBreakdown.map((p) => {
                  const percent = Math.round((p.value / metrics.totalCount) * 100);
                  return (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="font-bold text-gray-700 dark:text-gray-300">{p.name}</span>
                      </div>
                      <span className="text-gray-450 font-extrabold text-[11px]">
                        {p.value} {p.value === 1 ? "task" : "tasks"} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-xs text-gray-450 italic">No tasks with set priority levels.</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Velocity Chart */}
      <div className="bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-50 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250">Weekly Completion Rate</h3>
          </div>
          <p className="text-[10px] text-gray-404 dark:text-gray-500 font-semibold">
            Comparison of points completed vs tasks resolved
          </p>
        </div>

        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="hidden dark:block" />
              <XAxis dataKey="Week" stroke="#9ca3af" tickLine={false} />
              <YAxis stroke="#9ca3af" tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(224,242,254,0.8)",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                }}
                itemStyle={{ fontSize: "11px", fontWeight: "bold" }}
                labelStyle={{ fontWeight: "extrabold", color: "#374151" }}
              />
              <Legend iconType="rect" wrapperStyle={{ fontSize: "11px", fontWeight: "semibold", paddingTop: "10px" }} />
              <Bar dataKey="Points Earned" fill="#0ea5e9" name="Story Points Earned" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Tasks Completed" fill="#10b981" name="Tasks Done (Count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
