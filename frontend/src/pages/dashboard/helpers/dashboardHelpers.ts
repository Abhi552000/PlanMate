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
    if (selectedTimeframe !== "all" && task.dueDate) {
      const due = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const endOfWeek = new Date(today);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      if (selectedTimeframe === "today") {
        if (due < today || due >= tomorrow) return false;
      } else if (selectedTimeframe === "week") {
        if (due < today || due > endOfWeek) return false;
      } else if (selectedTimeframe === "overdue") {
        if (due >= today || task.completed) return false;
      }
    }
    return true;
  });
};
