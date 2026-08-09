import { ITask } from "../../types";

export const getWeeklyData = (tasks: ITask[]) => {
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
};

export const getBurndownData = (tasks: ITask[], totalStoryPoints: number) => {
  const trend = [];

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
};

export const getInsights = (tasks: ITask[], metrics: any) => {
  const list: any[] = [];

  // Overdue tasks
  if (metrics.overdueCount > 0) {
    list.push({
      text: `**${metrics.overdueCount} task${metrics.overdueCount > 1 ? "s are" : " is"} overdue** and past deadline. Let's adjust dates or solve these next.`,
      type: "overdue",
      filters: { timeframe: "overdue", status: "pending" }
    });
  }

  // High priority tasks
  const activeHigh = tasks.filter((t) => t.priority === "High" && t.status !== "Done").length;
  if (activeHigh > 0) {
    list.push({
      text: `**${activeHigh} high-priority tasks** are still in progress. We recommend focusing on these first.`,
      type: "highPriority",
      filters: { priority: "High", status: "pending" }
    });
  }

  // Unassigned tasks
  const activeUnassigned = tasks.filter((t) => !t.assignee && t.status !== "Done").length;
  if (activeUnassigned > 0) {
    list.push({
      text: `**${activeUnassigned} active tasks** have no assignee. Assigning owners helps get things done.`,
      type: "unassigned",
      filters: { assignee: "unassigned", status: "pending" }
    });
  }

  // Heavy workload bottleneck identification
  const userWorkload: { [name: string]: number } = {};
  const userIds: { [name: string]: string } = {};
  tasks.forEach((t) => {
    if (t.status !== "Done") {
      const name = t.assignee?.name || (typeof t.assignee === "object" ? t.assignee?.name : null);
      const id = t.assignee?._id || t.assignee?.id || (typeof t.assignee === "string" ? t.assignee : null);
      if (name && id) {
        userWorkload[name] = (userWorkload[name] || 0) + (t.storyPoints || 0);
        userIds[name] = id;
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
    list.push({
      text: `**${highestUser}** has a heavy workload with **${highestPoints} story points**. Consider delegating tasks.`,
      type: "workload",
      filters: { assignee: userIds[highestUser], status: "pending" }
    });
  }

  // Completion percentage comments
  if (metrics.totalCount > 0) {
    if (metrics.completionRate === 100) {
      list.push({
        text: "**Awesome!** All tasks are completed under these filters.",
        type: "progress",
        filters: { status: "Done" }
      });
    } else if (metrics.completionRate >= 75) {
      list.push({
        text: `**Almost there!** You've completed **${metrics.completionRate}%** of tasks. Just **${metrics.pendingCount} left**!`,
        type: "progress",
        filters: { status: "Done" }
      });
    } else if (metrics.completionRate > 0) {
      list.push({
        text: `Progress is at **${metrics.completionRate}%** (${metrics.completedCount} out of ${metrics.totalCount} tasks completed).`,
        type: "progress",
        filters: { status: "Done" }
      });
    }
  }

  if (list.length === 0) {
    list.push({
      text: "Filters show no active tasks. Try clearing search or filters to see metrics.",
      type: "progress",
      filters: {}
    });
  }

  return list;
};

export const getSprintVelocityData = (tasks: ITask[]) => {
  const sprintMap: { [id: string]: { name: string; committed: number; completed: number } } = {};

  tasks.forEach((t) => {
    if (t.sprint && typeof t.sprint === "object" && t.sprint.name) {
      const sprintId = t.sprint._id || t.sprint.id || t.sprint.name;
      if (!sprintMap[sprintId]) {
        sprintMap[sprintId] = {
          name: t.sprint.name,
          committed: 0,
          completed: 0,
        };
      }
      const points = t.storyPoints || 0;
      sprintMap[sprintId].committed += points;
      if (t.status === "Done" || t.completed === "Yes" || t.completed === true) {
        sprintMap[sprintId].completed += points;
      }
    }
  });

  return Object.values(sprintMap);
};

export const getCFDData = (tasks: ITask[]) => {
  const cfdData = [];
  const now = new Date();

  // Analyze status counts for the last 7 days
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() - i);
    const dayEnd = new Date(targetDate.setHours(23, 59, 59, 999));

    const counts: { [status: string]: number } = {
      "To Do": 0,
      "In Progress": 0,
      "Done": 0,
    };

    tasks.forEach((t) => {
      if (t.createdAt && new Date(t.createdAt) > dayEnd) {
        return;
      }

      let dayStatus = t.status || "To Do";

      if (t.history && Array.isArray(t.history)) {
        const sortedHistory = [...t.history]
          .filter((h) => h.field === "status")
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        for (const h of sortedHistory) {
          if (new Date(h.updatedAt) > dayEnd) {
            dayStatus = h.oldValue || "To Do";
          } else {
            break;
          }
        }
      }

      let groupKey = "To Do";
      if (dayStatus === "Done" || dayStatus === "Closed") {
        groupKey = "Done";
      } else if (dayStatus === "In Progress" || dayStatus === "QA Ready" || dayStatus === "CR Ready") {
        groupKey = "In Progress";
      }

      counts[groupKey] = (counts[groupKey] || 0) + 1;
    });

    cfdData.push({
      day: targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      "To Do": counts["To Do"],
      "In Progress": counts["In Progress"],
      "Done": counts["Done"],
    });
  }

  return cfdData;
};

