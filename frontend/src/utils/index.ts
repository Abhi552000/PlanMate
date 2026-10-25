import { ITask } from "../types";

export const getPriorityStyle = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-red-605 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30";
    case "medium":
      return "text-gray-700 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700";
    default:
      return "text-green-605 bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30";
  }
};

export const calculateSprintMetrics = (tasks: ITask[]) => {
  let todo = 0, progress = 0, done = 0;
  tasks.forEach((t) => {
    const sp = t.storyPoints || 0;
    if (t.status === "Done" || t.status === "Closed") {
      done += sp;
    } else if (t.status === "In Progress" || t.status === "QA Ready" || t.status === "CR Ready") {
      progress += sp;
    } else {
      todo += sp;
    }
  });
  return { todo, progress, done };
};

export const getRemainingDaysText = (endDate?: string): string | null => {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - new Date().getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? `${days} days remaining` : "Sprint ended";
};

export const getNormalizedTaskData = (taskToEdit: any, defaultTask: any) => {
  if (!taskToEdit) {
    return {
      ...defaultTask,
      subtasks: [],
      status: "To Do",
      issueType: "Task",
      storyPoints: 1,
      assignee: "",
      key: "",
      sprint: "",
      epic: ""
    };
  }
  const normalized =
    taskToEdit.completed === "yes" || taskToEdit.completed === true || taskToEdit.completed === "Yes"
      ? "Yes"
      : "No";
  return {
    ...defaultTask,
    title: taskToEdit.title || "",
    description: taskToEdit.description || "",
    priority: taskToEdit.priority || "Low",
    dueDate: typeof taskToEdit.dueDate === "string" ? taskToEdit.dueDate.split("T")[0] : "",
    completed: normalized,
    id: taskToEdit._id,
    subtasks: taskToEdit.subtasks || [],
    status: taskToEdit.status || "To Do",
    issueType: taskToEdit.issueType || "Task",
    storyPoints: taskToEdit.storyPoints !== undefined ? taskToEdit.storyPoints : 1,
    assignee: typeof taskToEdit.assignee === "object" && taskToEdit.assignee ? (taskToEdit.assignee as any)._id : taskToEdit.assignee || "",
    reporter: typeof taskToEdit.reporter === "object" && taskToEdit.reporter ? (taskToEdit.reporter as any)._id : taskToEdit.reporter || "",
    labels: Array.isArray(taskToEdit.labels) ? taskToEdit.labels : [],
    originalEstimate: taskToEdit.originalEstimate !== undefined ? taskToEdit.originalEstimate : 0,
    key: taskToEdit.key || "",
    sprint: typeof taskToEdit.sprint === "object" && taskToEdit.sprint ? (taskToEdit.sprint as any)._id : taskToEdit.sprint || "",
    epic: typeof taskToEdit.epic === "object" && taskToEdit.epic ? (taskToEdit.epic as any)._id : taskToEdit.epic || "",
  };
};

export const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

export const generateCalendarDays = (currentYear: number, currentMonth: number) => {
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(currentYear, currentMonth, i),
      isCurrentMonth: true,
    });
  }

  // Next month padding
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const totalCellsNeeded = 42;
  const remainingCells = totalCellsNeeded - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(nextYear, nextMonth, i),
      isCurrentMonth: false,
    });
  }

  return days;
};
