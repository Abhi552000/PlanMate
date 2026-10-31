import { ITask } from "../../../types";

export interface IDonutItem {
  name: string;
  value: number;
  color: string;
}

export interface ILeadTimePoint {
  date: string;
  bug: number;
  task: number;
  story: number;
  epic?: number;
}

export interface ICompletionTrendPoint {
  period: string;
  task: number;
  bug: number;
  story: number;
  epic: number;
  total: number;
}

export interface ICycleTimePoint {
  date: string;
  cycleTime: number; // in days
  key?: string;
  title?: string;
}

export interface ICreationTrendPoint {
  period: string;
  todo: number;
  inProgress: number;
  done: number;
  reopen: number;
  total: number;
}

const STATUS_COLORS: Record<string, string> = {
  "to do": "#4c9aff", // Jira Blue
  "in progress": "#ffab00", // Jira Amber
  "done": "#36b37e", // Jira Green
  "reopen": "#6554c0", // Jira Purple
  "closed": "#5e6c84", // Jira Gray
  "qa ready": "#00b8d9", // Jira Teal
  "cr ready": "#5243aa", // Jira Indigo
  "backlog": "#6b778c",
};

const TYPE_COLORS: Record<string, string> = {
  task: "#4c9aff", // Jira Blue
  bug: "#ff5630", // Jira Crimson
  story: "#36b37e", // Jira Green
  epic: "#6554c0", // Jira Purple
  subtask: "#00b8d9", // Jira Teal
};

const ASSIGNEE_PALETTE = [
  "#0052cc", // Jira Navy
  "#36b37e", // Jira Green
  "#ffab00", // Jira Amber
  "#6554c0", // Jira Purple
  "#00b8d9", // Jira Teal
  "#ff5630", // Jira Red
  "#42526e", // Jira Slate
  "#2684ff", // Jira Bright Blue
  "#57d9a3", // Jira Sage
  "#8777d9", // Jira Lavender
];

// Helper: Get days difference
export const getDaysDiff = (d1: Date, d2: Date) => {
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
};

export interface IReportKPIs {
  completedCount: number;
  inProgressCount: number;
  openCount: number;
  createdCount: number;
  dueCount: number;
  totalCount: number;
  completionRate: string;
  timeframe: "all" | "30d" | "7d";
  periodLabel: string;
}

// 1. Calculate Dynamic KPIs based on selected timeframe
export const calculateReportKPIs = (
  tasks: ITask[],
  timeframe: "all" | "30d" | "7d" = "all"
): IReportKPIs => {
  const now = new Date();
  const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : null;
  const pastCutoff = days ? new Date(now.getTime() - days * 24 * 60 * 60 * 1000) : null;
  const futureCutoff = days ? new Date(now.getTime() + days * 24 * 60 * 60 * 1000) : null;

  let completedCount = 0;
  let inProgressCount = 0;
  let openCount = 0;
  let createdCount = 0;
  let dueCount = 0;

  tasks.forEach((t) => {
    const isDone =
      t.status === "Done" ||
      t.completed === true ||
      t.completed === "Yes" ||
      (t.status || "").toLowerCase() === "done" ||
      (t.status || "").toLowerCase() === "closed";

    const statusLower = (t.status || "").toLowerCase();
    const isInProgress =
      !isDone &&
      (statusLower.includes("progress") ||
        statusLower.includes("qa") ||
        statusLower.includes("cr") ||
        statusLower.includes("review") ||
        statusLower === "reopen");

    const updatedAt = t.updatedAt ? new Date(t.updatedAt) : null;
    const createdAt = t.createdAt ? new Date(t.createdAt) : null;
    const activityDate = updatedAt || createdAt;

    // Completed
    if (isDone) {
      if (!pastCutoff || (activityDate && activityDate >= pastCutoff && activityDate <= now)) {
        completedCount++;
      }
    } else {
      openCount++;
    }

    // In Progress / Active Work
    if (isInProgress) {
      if (!pastCutoff || (activityDate && activityDate >= pastCutoff && activityDate <= now)) {
        inProgressCount++;
      }
    }

    // Created
    if (createdAt) {
      if (!pastCutoff || (createdAt >= pastCutoff && createdAt <= now)) {
        createdCount++;
      }
    } else if (!pastCutoff) {
      createdCount++;
    }

    // Due
    if (t.dueDate && !isDone) {
      const due = new Date(t.dueDate);
      if (!futureCutoff || (due >= now && due <= futureCutoff)) {
        dueCount++;
      }
    }
  });

  const totalCount = tasks.length;
  const completionRate =
    totalCount > 0 ? `${((completedCount / totalCount) * 100).toFixed(1)}%` : "0%";

  const periodLabel =
    timeframe === "7d"
      ? "the last 7 days"
      : timeframe === "30d"
      ? "the last 30 days"
      : "all time";

  return {
    completedCount,
    inProgressCount,
    openCount,
    createdCount,
    dueCount,
    totalCount,
    completionRate,
    timeframe,
    periodLabel,
  };
};

// 2. Donut: Work items by Status
export const getWorkItemsByStatus = (tasks: ITask[]): IDonutItem[] => {
  const map: Record<string, number> = {};
  tasks.forEach((t) => {
    const s = t.status || (t.completed ? "Done" : "To Do");
    map[s] = (map[s] || 0) + 1;
  });

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLORS[name.toLowerCase()] || "#94a3b8",
  }));
};

// 3. Donut: Work items by Type
export const getWorkItemsByType = (tasks: ITask[]): IDonutItem[] => {
  const map: Record<string, number> = {};
  tasks.forEach((t) => {
    const type = t.issueType || "Task";
    map[type] = (map[type] || 0) + 1;
  });

  return Object.entries(map).map(([name, value]) => ({
    name,
    value,
    color: TYPE_COLORS[name.toLowerCase()] || "#38bdf8",
  }));
};

// 4. Donut: Work items by Assignee
export const getWorkItemsByAssignee = (tasks: ITask[]): IDonutItem[] => {
  const map: Record<string, number> = {};
  tasks.forEach((t) => {
    let name = "Unassigned";
    if (t.assignee) {
      name = typeof t.assignee === "object" ? t.assignee.name || "Member" : "Member";
    }
    map[name] = (map[name] || 0) + 1;
  });

  return Object.entries(map).map(([name, value], idx) => ({
    name,
    value,
    color: name === "Unassigned" ? "#94a3b8" : ASSIGNEE_PALETTE[idx % ASSIGNEE_PALETTE.length],
  }));
};

// 5. Work Item Lead Time (by creation dates)
export const getLeadTimeData = (tasks: ITask[]): ILeadTimePoint[] => {
  const dateMap: Record<string, { bug: number[]; task: number[]; story: number[] }> = {};

  tasks.forEach((t) => {
    if (!t.createdAt) return;
    const cDate = new Date(t.createdAt).toISOString().split("T")[0];
    if (!dateMap[cDate]) {
      dateMap[cDate] = { bug: [], task: [], story: [] };
    }

    const type = (t.issueType || "Task").toLowerCase();
    const isDone = t.status === "Done" || t.completed === true;
    const endDate = isDone && t.updatedAt ? new Date(t.updatedAt) : new Date();
    const days = getDaysDiff(new Date(t.createdAt), endDate);

    if (type === "bug") dateMap[cDate].bug.push(days);
    else if (type === "story") dateMap[cDate].story.push(days);
    else dateMap[cDate].task.push(days);
  });

  const sortedDates = Object.keys(dateMap).sort().slice(-10); // last 10 distinct dates

  return sortedDates.map((date) => {
    const entry = dateMap[date];
    const avg = (arr: number[]) => (arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
    return {
      date: date.slice(5), // MM-DD
      bug: avg(entry.bug),
      task: avg(entry.task),
      story: avg(entry.story),
    };
  });
};

// 6. Work Item Cycle Time (Days taken from in progress/created to done)
export const getCycleTimeData = (tasks: ITask[]): ICycleTimePoint[] => {
  const completed = tasks.filter(
    (t) => t.status === "Done" || t.completed === true || t.completed === "Yes"
  );

  return completed.slice(-12).map((t) => {
    const start = t.createdAt ? new Date(t.createdAt) : new Date();
    const end = t.updatedAt ? new Date(t.updatedAt) : new Date();
    const diff = getDaysDiff(start, end);
    const dateLabel = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return {
      date: dateLabel,
      cycleTime: diff,
      key: t.key || (t._id ? `PM-${t._id.slice(-4).toUpperCase()}` : "TASK"),
      title: t.title,
    };
  });
};

// 7. Work Item Completion Trend (by Month/Period, stacked by Type)
export const getCompletionTrendData = (
  tasks: ITask[],
  timeframe: "all" | "30d" | "7d" = "all"
): ICompletionTrendPoint[] => {
  const periodMap: Record<
    string,
    { task: number; bug: number; story: number; epic: number; label: string; sortKey: string }
  > = {};

  tasks.forEach((t) => {
    const isDone =
      t.status === "Done" ||
      t.completed === true ||
      t.completed === "Yes" ||
      (t.status || "").toLowerCase() === "done" ||
      (t.status || "").toLowerCase() === "closed";
    if (!isDone) return;
    const d = t.updatedAt ? new Date(t.updatedAt) : t.createdAt ? new Date(t.createdAt) : new Date();

    let label = "";
    let sortKey = "";

    if (timeframe === "7d") {
      label = d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
      sortKey = d.toISOString().split("T")[0];
    } else if (timeframe === "30d") {
      label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      sortKey = d.toISOString().split("T")[0];
    } else {
      label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    if (!periodMap[sortKey]) {
      periodMap[sortKey] = { task: 0, bug: 0, story: 0, epic: 0, sortKey, label };
    }

    const type = (t.issueType || "Task").toLowerCase();
    if (type === "bug") periodMap[sortKey].bug++;
    else if (type === "story") periodMap[sortKey].story++;
    else if (type === "epic") periodMap[sortKey].epic++;
    else periodMap[sortKey].task++;
  });

  const sortedKeys = Object.keys(periodMap).sort();
  const recentKeys = sortedKeys.slice(timeframe === "all" ? -6 : -8);

  // If no completed items, fallback
  if (recentKeys.length === 0) {
    const now = new Date();
    const curLabel =
      timeframe === "7d"
        ? now.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" })
        : timeframe === "30d"
        ? now.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : now.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    return [{ period: curLabel, task: 0, bug: 0, story: 0, epic: 0, total: 0 }];
  }

  return recentKeys.map((k) => {
    const entry = periodMap[k];
    const total = entry.task + entry.bug + entry.story + entry.epic;
    return {
      period: entry.label || k,
      task: entry.task,
      bug: entry.bug,
      story: entry.story,
      epic: entry.epic,
      total,
    };
  });
};

// 8. Work Item Creation Trend (by Week/Month, stacked by Status)
export const getCreationTrendData = (
  tasks: ITask[],
  timeframe: "all" | "30d" | "7d" = "all"
): ICreationTrendPoint[] => {
  const map: Record<
    string,
    { todo: number; inProgress: number; done: number; reopen: number; label: string; sortKey: string }
  > = {};

  tasks.forEach((t) => {
    const d = t.createdAt ? new Date(t.createdAt) : new Date();

    let label = "";
    let sortKey = "";

    if (timeframe === "7d") {
      label = d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" });
      sortKey = d.toISOString().split("T")[0];
    } else if (timeframe === "30d") {
      label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      sortKey = d.toISOString().split("T")[0];
    } else {
      label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    if (!map[sortKey]) {
      map[sortKey] = { todo: 0, inProgress: 0, done: 0, reopen: 0, label, sortKey };
    }

    const status = (t.status || "To Do").toLowerCase();
    if (status.includes("progress") || status.includes("qa") || status.includes("cr")) {
      map[sortKey].inProgress++;
    } else if (status.includes("done") || status.includes("closed") || t.completed) {
      map[sortKey].done++;
    } else if (status.includes("reopen")) {
      map[sortKey].reopen++;
    } else {
      map[sortKey].todo++;
    }
  });

  const sortedKeys = Object.keys(map).sort();
  const recentKeys = sortedKeys.slice(timeframe === "all" ? -6 : -8);

  if (recentKeys.length === 0) {
    const now = new Date();
    const curLabel =
      timeframe === "7d"
        ? now.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" })
        : timeframe === "30d"
        ? now.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : now.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    return [{ period: curLabel, todo: 0, inProgress: 0, done: 0, reopen: 0, total: 0 }];
  }

  return recentKeys.map((k) => {
    const entry = map[k];
    const total = entry.todo + entry.inProgress + entry.done + entry.reopen;
    return {
      period: entry.label || k,
      todo: entry.todo,
      inProgress: entry.inProgress,
      done: entry.done,
      reopen: entry.reopen,
      total,
    };
  });
};
