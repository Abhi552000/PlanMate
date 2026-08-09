import { ITask, FilterOptions } from "../../../types";

export const filterDashboardTasks = (tasks: ITask[], options: FilterOptions) => {
  const { searchQuery, selectedAssignee, selectedPriority, selectedStatus, selectedTimeframe } = options;
  return tasks.filter((task) => {
    // 1. Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDesc = task.description?.toLowerCase().includes(query) || false;
      const matchesKey = task.key?.toLowerCase().includes(query) || false;
      if (!matchesTitle && !matchesDesc && !matchesKey) return false;
    }
    // 2. Assignee
    if (selectedAssignee !== "all") {
      if (selectedAssignee === "unassigned") {
        if (task.assignee) return false;
      } else {
        const assigneeId = task.assignee?._id || task.assignee;
        if (assigneeId !== selectedAssignee) return false;
      }
    }
    // 3. Priority
    if (selectedPriority !== "all" && task.priority !== selectedPriority) return false;
    // 4. Status
    if (selectedStatus !== "all") {
      if (selectedStatus === "pending") {
        if (task.status === "Done") return false;
      } else {
        if (task.status !== selectedStatus) return false;
      }
    }
    // 5. Timeframe
    if (selectedTimeframe !== "all") {
      if (!task.dueDate) return false;

      const getLocalYYYYMMDD = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const dueStr =
        typeof task.dueDate === "string"
          ? task.dueDate.split("T")[0]
          : getLocalYYYYMMDD(new Date(task.dueDate));
      const todayStr = getLocalYYYYMMDD(new Date());

      const isCompleted =
        task.completed === true ||
        task.completed === "Yes" ||
        task.status === "Done";

      if (selectedTimeframe === "today") {
        if (dueStr !== todayStr) return false;
      } else if (selectedTimeframe === "week") {
        const dueTime = new Date(dueStr).getTime();
        const todayTime = new Date(todayStr).getTime();
        const nextWeekTime = todayTime + 7 * 24 * 60 * 60 * 1000;
        if (dueTime < todayTime || dueTime > nextWeekTime) return false;
      } else if (selectedTimeframe === "overdue") {
        if (dueStr >= todayStr || isCompleted) return false;
      }
    }
    return true;
  });
};
