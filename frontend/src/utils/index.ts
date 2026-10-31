import React from "react";
import { Bug, BookOpen, Award, CheckSquare, CornerDownRight } from "lucide-react";
import { ITask } from "../types";

export const getIssueTypeIcon = (type?: string, className: string = "w-4 h-4") => {
  switch (type?.toLowerCase()) {
    case "bug":
      return React.createElement(Bug, {
        className: `${className} text-rose-500 fill-rose-500/20 shrink-0`,
      });
    case "story":
      return React.createElement(BookOpen, {
        className: `${className} text-emerald-500 fill-emerald-500/20 shrink-0`,
      });
    case "epic":
      return React.createElement(Award, {
        className: `${className} text-purple-500 fill-purple-500/20 shrink-0`,
      });
    case "sub-task":
    case "subtask":
      return React.createElement(CornerDownRight, {
        className: `${className} text-sky-500 shrink-0`,
      });
    default:
      return React.createElement(CheckSquare, {
        className: `${className} text-sky-500 fill-sky-500/20 shrink-0`,
      });
  }
};

export const getPriorityStyle = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50";
    case "medium":
      return "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50";
    case "low":
    default:
      return "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50";
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
    id: taskToEdit._id || taskToEdit.id || null,
    _id: taskToEdit._id || taskToEdit.id || null,
    subtasks: Array.isArray(taskToEdit.subtasks) ? taskToEdit.subtasks : [],
    links: Array.isArray(taskToEdit.links) ? taskToEdit.links : [],
    workLogs: Array.isArray(taskToEdit.workLogs) ? taskToEdit.workLogs : [],
    timeLogged: typeof taskToEdit.timeLogged === "number" ? taskToEdit.timeLogged : 0,
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
