import React, { useState, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { BarChart2, RefreshCw, Layers } from "lucide-react";
import { DashboardContext, ITask } from "../../types";
import {
  calculateReportKPIs,
  getWorkItemsByStatus,
  getWorkItemsByType,
  getWorkItemsByAssignee,
  getLeadTimeData,
  getCycleTimeData,
  getCompletionTrendData,
  getCreationTrendData,
} from "./utils/reportCalculations";
import { ReportSummaryKPIs } from "./components/ReportSummaryKPIs";
import { ReportDonutBreakdowns } from "./components/ReportDonutBreakdowns";
import { ReportTrendsSection } from "./components/ReportTrendsSection";
import { ReportWorkItemTable } from "./components/ReportWorkItemTable";
import { ReportWorkItemDrawer } from "./components/ReportWorkItemDrawer";

export const ReportsPage: React.FC = () => {
  const { tasks, refreshTasks, loading } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();

  const [timeframe, setTimeframe] = useState<"all" | "30d" | "7d">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Drawer state for drilldowns
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState("View work items");
  const [drawerSubtitle, setDrawerSubtitle] = useState("");
  const [drawerTasks, setDrawerTasks] = useState<ITask[]>([]);

  // Time-filtered tasks
  const filteredTasks = useMemo(() => {
    if (timeframe === "all") return tasks;
    const now = new Date().getTime();
    const daysMap = { "7d": 7, "30d": 30 };
    const cutoff = now - (daysMap[timeframe] || 30) * 24 * 60 * 60 * 1000;

    return tasks.filter((t) => {
      const date = t.createdAt ? new Date(t.createdAt).getTime() : 0;
      return date >= cutoff;
    });
  }, [tasks, timeframe]);

  // Calculated Metrics (KPIs and trends dynamically adjust with timeframe)
  const kpis = useMemo(() => calculateReportKPIs(tasks, timeframe), [tasks, timeframe]);
  const statusDonut = useMemo(() => getWorkItemsByStatus(filteredTasks), [filteredTasks]);
  const typeDonut = useMemo(() => getWorkItemsByType(filteredTasks), [filteredTasks]);
  const assigneeDonut = useMemo(() => getWorkItemsByAssignee(filteredTasks), [filteredTasks]);
  const leadTimeData = useMemo(() => getLeadTimeData(filteredTasks), [filteredTasks]);
  const cycleTimeData = useMemo(() => getCycleTimeData(filteredTasks), [filteredTasks]);
  const completionTrendData = useMemo(
    () => getCompletionTrendData(filteredTasks, timeframe),
    [filteredTasks, timeframe]
  );
  const creationTrendData = useMemo(
    () => getCreationTrendData(filteredTasks, timeframe),
    [filteredTasks, timeframe]
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTasks();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // KPI card click handler
  const handleKPIClick = (type: string) => {
    const now = new Date();
    const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : null;
    const pastCutoff = days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null;
    const futureCutoff = days ? new Date(now.getTime() + days * 24 * 60 * 60 * 1000) : null;

    let matching: ITask[] = [];
    let title = "";

    if (type === "completed") {
      title = `Resolved Issues (${timeframe === "all" ? "All Time" : timeframe === "30d" ? "Last 30 Days" : "Last 7 Days"})`;
      matching = tasks.filter((t) => {
        const isDone =
          t.status === "Done" ||
          t.completed === true ||
          t.completed === "Yes" ||
          (t.status || "").toLowerCase() === "done" ||
          (t.status || "").toLowerCase() === "closed";
        const d = t.updatedAt ? new Date(t.updatedAt) : t.createdAt ? new Date(t.createdAt) : null;
        return isDone && (!pastCutoff || (d && d >= pastCutoff && d <= now));
      });
    } else if (type === "inProgress" || type === "open") {
      title = `In Progress / Active Issues`;
      matching = tasks.filter((t) => {
        const isDone =
          t.status === "Done" ||
          t.completed === true ||
          t.completed === "Yes" ||
          (t.status || "").toLowerCase() === "done" ||
          (t.status || "").toLowerCase() === "closed";
        return !isDone;
      });
    } else if (type === "created") {
      title = `Created Issues (${timeframe === "all" ? "All Time" : timeframe === "30d" ? "Last 30 Days" : "Last 7 Days"})`;
      matching = tasks.filter((t) => {
        const d = t.createdAt ? new Date(t.createdAt) : null;
        return !pastCutoff || (d && d >= pastCutoff && d <= now);
      });
    } else if (type === "due") {
      title =
        timeframe === "all"
          ? "Due & Open Issues"
          : `Due in ${kpis.periodLabel.replace("the last", "the next")}`;
      matching = tasks.filter((t) => {
        const isDone =
          t.status === "Done" ||
          t.completed === true ||
          (t.status || "").toLowerCase() === "done";
        if (!t.dueDate || isDone) return false;
        const d = new Date(t.dueDate);
        return !futureCutoff || (d >= now && d <= futureCutoff);
      });
    }

    setDrawerTitle("View work items");
    setDrawerSubtitle(title);
    setDrawerTasks(matching);
    setDrawerOpen(true);
  };

  // Donut slice click handler
  const handleSliceClick = (category: "status" | "type" | "assignee", value: string) => {
    let matching: ITask[] = [];

    if (category === "status") {
      matching = filteredTasks.filter(
        (t) => (t.status || (t.completed ? "Done" : "To Do")).toLowerCase() === value.toLowerCase()
      );
    } else if (category === "type") {
      matching = filteredTasks.filter(
        (t) => (t.issueType || "Task").toLowerCase() === value.toLowerCase()
      );
    } else if (category === "assignee") {
      matching = filteredTasks.filter((t) => {
        const name =
          typeof t.assignee === "object" && t.assignee?.name
            ? t.assignee.name
            : "Unassigned";
        return name.toLowerCase() === value.toLowerCase();
      });
    }

    setDrawerTitle("View work items");
    setDrawerSubtitle(`Filtered by ${category}: ${value}`);
    setDrawerTasks(matching);
    setDrawerOpen(true);
  };

  if (loading && (!tasks || tasks.length === 0)) {
    return (
      <div className="w-full space-y-6 pb-12 font-sans select-none animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="space-y-1.5">
            <div className="h-7 w-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-64 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="h-9 w-44 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs space-y-2"
            >
              <div className="h-3.5 w-24 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-7 w-16 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs space-y-4"
            >
              <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="w-36 h-36 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Reports
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Project insights and performance metrics.
          </p>
        </div>

        {/* Timeframe selector & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Timeframe pills */}
          <div className="flex items-center p-1 rounded-lg bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-xs">
            {(["all", "30d", "7d"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors cursor-pointer ${
                  timeframe === t
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {t === "all" ? "All Time" : `Last ${t.replace("d", " days")}`}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
            title="Refresh reports data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-sky-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* 1. Top 4 7-Day KPI Cards */}
      <ReportSummaryKPIs kpis={kpis} onFilterClick={handleKPIClick} />

      {/* 2. Donut Breakdown Charts (Status, Type, Assignee) */}
      <ReportDonutBreakdowns
        statusData={statusDonut}
        typeData={typeDonut}
        assigneeData={assigneeDonut}
        totalTasks={filteredTasks.length}
        onSliceClick={handleSliceClick}
      />

      {/* 3. Trends & Agile Performance Section */}
      <ReportTrendsSection
        leadTimeData={leadTimeData}
        completionTrendData={completionTrendData}
        cycleTimeData={cycleTimeData}
        creationTrendData={creationTrendData}
      />

      {/* 4. Tabular Work Item Details with CSV Export & Search */}
      <ReportWorkItemTable
        tasks={filteredTasks}
        onSelectTask={(task) => navigate(`/task/${task._id}`)}
      />

      {/* 5. View Work Items Side Drawer */}
      <ReportWorkItemDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
        subtitle={drawerSubtitle}
        tasks={drawerTasks}
      />
    </div>
  );
};

export default ReportsPage;
