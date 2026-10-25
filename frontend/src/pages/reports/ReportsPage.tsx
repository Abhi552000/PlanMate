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
  const { tasks, refreshTasks } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();

  const [timeframe, setTimeframe] = useState<"all" | "30d" | "14d" | "7d">("all");
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
    const daysMap = { "7d": 7, "14d": 14, "30d": 30 };
    const cutoff = now - (daysMap[timeframe] || 30) * 24 * 60 * 60 * 1000;

    return tasks.filter((t) => {
      const date = t.createdAt ? new Date(t.createdAt).getTime() : 0;
      return date >= cutoff;
    });
  }, [tasks, timeframe]);

  // Calculated Metrics
  const kpis = useMemo(() => calculateReportKPIs(tasks), [tasks]);
  const statusDonut = useMemo(() => getWorkItemsByStatus(filteredTasks), [filteredTasks]);
  const typeDonut = useMemo(() => getWorkItemsByType(filteredTasks), [filteredTasks]);
  const assigneeDonut = useMemo(() => getWorkItemsByAssignee(filteredTasks), [filteredTasks]);
  const leadTimeData = useMemo(() => getLeadTimeData(filteredTasks), [filteredTasks]);
  const cycleTimeData = useMemo(() => getCycleTimeData(filteredTasks), [filteredTasks]);
  const completionTrendData = useMemo(() => getCompletionTrendData(filteredTasks), [filteredTasks]);
  const creationTrendData = useMemo(() => getCreationTrendData(filteredTasks), [filteredTasks]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshTasks();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // KPI card click handler
  const handleKPIClick = (type: string) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysFuture = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    let matching: ITask[] = [];
    let title = "";

    if (type === "completed") {
      title = "Completed in last 7 days";
      matching = tasks.filter((t) => {
        const isDone = t.status === "Done" || t.completed === true;
        const d = t.updatedAt ? new Date(t.updatedAt) : null;
        return isDone && d && d >= sevenDaysAgo && d <= now;
      });
    } else if (type === "updated") {
      title = "Updated in last 7 days";
      matching = tasks.filter((t) => {
        const d = t.updatedAt ? new Date(t.updatedAt) : null;
        return d && d >= sevenDaysAgo && d <= now;
      });
    } else if (type === "created") {
      title = "Created in last 7 days";
      matching = tasks.filter((t) => {
        const d = t.createdAt ? new Date(t.createdAt) : null;
        return d && d >= sevenDaysAgo && d <= now;
      });
    } else if (type === "due") {
      title = "Due in next 7 days";
      matching = tasks.filter((t) => {
        const isDone = t.status === "Done" || t.completed === true;
        if (!t.dueDate || isDone) return false;
        const d = new Date(t.dueDate);
        return d >= now && d <= sevenDaysFuture;
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

  return (
    <div className="w-full space-y-6 pb-12 animate-fadeIn font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-sky-100/70 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Reports
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Deep Jira-style insights into team velocity, cycle time, completion throughput, and work items.
          </p>
        </div>

        {/* Timeframe selector & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Timeframe pills */}
          <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-900 border border-sky-100 dark:border-gray-800 text-xs">
            {(["all", "30d", "14d", "7d"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                  timeframe === t
                    ? "bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 shadow-xs"
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
            className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 hover:bg-sky-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors shadow-xs cursor-pointer"
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

      {/* 5. Jira-Style View Work Items Side Drawer */}
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
