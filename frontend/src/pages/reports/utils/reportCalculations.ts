import { ITask } from "../../../types";

export interface IReportKPIs {
  completedLast7Days: number;
  updatedLast7Days: number;
  createdLast7Days: number;
  dueNext7Days: number;
}

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
  "to do": "#38bdf8", // Sky
  "in progress": "#f59e0b", // Amber
  "done": "#10b981", // Emerald
  "reopen": "#a855f7", // Purple
  "closed": "#64748b", // Slate
  "qa ready": "#06b6d4",
  "cr ready": "#6366f1",
};

const TYPE_COLORS: Record<string, string> = {
  task: "#0ea5e9", // Sky
  bug: "#f43f5e", // Rose
  story: "#10b981", // Emerald
  epic: "#8b5cf6", // Purple
};

const ASSIGNEE_PALETTE = [
  "#38bdf8",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#64748b",
];

// Helper: Get days difference
export const getDaysDiff = (d1: Date, d2: Date) => {
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));
};

// 1. Calculate Top 4 7-Day KPIs
export const calculateReportKPIs = (tasks: ITask[]): IReportKPIs => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sevenDaysFuture = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let completedLast7Days = 0;
  let updatedLast7Days = 0;
  let createdLast7Days = 0;
  let dueNext7Days = 0;

  tasks.forEach((t) => {
    // Completed in last 7 days
    const isDone = t.status === "Done" || t.completed === true || t.completed === "Yes";
    const updatedAt = t.updatedAt ? new Date(t.updatedAt) : null;
    const createdAt = t.createdAt ? new Date(t.createdAt) : null;

    if (isDone && updatedAt && updatedAt >= sevenDaysAgo && updatedAt <= now) {
      completedLast7Days++;
    }

    // Updated in last 7 days
    if (updatedAt && updatedAt >= sevenDaysAgo && updatedAt <= now) {
      updatedLast7Days++;
    }

    // Created in last 7 days
    if (createdAt && createdAt >= sevenDaysAgo && createdAt <= now) {
      createdLast7Days++;
    }

    // Due in next 7 days (and not already completed)
    if (t.dueDate && !isDone) {
      const due = new Date(t.dueDate);
      if (due >= now && due <= sevenDaysFuture) {
        dueNext7Days++;
      }
    }
  });

  return {
    completedLast7Days,
    updatedLast7Days,
    createdLast7Days,
    dueNext7Days,
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
export const getCompletionTrendData = (tasks: ITask[]): ICompletionTrendPoint[] => {
  const periodMap: Record<string, { task: number; bug: number; story: number; epic: number }> = {};

  tasks.forEach((t) => {
    const isDone = t.status === "Done" || t.completed === true;
    if (!isDone) return;
    const d = t.updatedAt ? new Date(t.updatedAt) : new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (!periodMap[key]) {
      periodMap[key] = { task: 0, bug: 0, story: 0, epic: 0 };
    }

    const type = (t.issueType || "Task").toLowerCase();
    if (type === "bug") periodMap[key].bug++;
    else if (type === "story") periodMap[key].story++;
    else if (type === "epic") periodMap[key].epic++;
    else periodMap[key].task++;
  });

  const sortedPeriods = Object.keys(periodMap).sort().slice(-6);

  // If no completed items, fallback to current month
  if (sortedPeriods.length === 0) {
    const now = new Date();
    const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return [{ period: curKey, task: 0, bug: 0, story: 0, epic: 0, total: 0 }];
  }

  return sortedPeriods.map((period) => {
    const entry = periodMap[period];
    const total = entry.task + entry.bug + entry.story + entry.epic;
    return {
      period,
      ...entry,
      total,
    };
  });
};

// 8. Work Item Creation Trend (by Week/Month, stacked by Status)
export const getCreationTrendData = (tasks: ITask[]): ICreationTrendPoint[] => {
  const map: Record<string, { todo: number; inProgress: number; done: number; reopen: number }> = {};

  tasks.forEach((t) => {
    const d = t.createdAt ? new Date(t.createdAt) : new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (!map[key]) {
      map[key] = { todo: 0, inProgress: 0, done: 0, reopen: 0 };
    }

    const status = (t.status || "To Do").toLowerCase();
    if (status.includes("progress")) map[key].inProgress++;
    else if (status.includes("done") || status.includes("closed")) map[key].done++;
    else if (status.includes("reopen")) map[key].reopen++;
    else map[key].todo++;
  });

  const sortedKeys = Object.keys(map).sort().slice(-6);

  if (sortedKeys.length === 0) {
    const now = new Date();
    const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return [{ period: curKey, todo: 0, inProgress: 0, done: 0, reopen: 0, total: 0 }];
  }

  return sortedKeys.map((period) => {
    const entry = map[period];
    const total = entry.todo + entry.inProgress + entry.done + entry.reopen;
    return {
      period,
      ...entry,
      total,
    };
  });
};
