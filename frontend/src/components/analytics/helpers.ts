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
};
