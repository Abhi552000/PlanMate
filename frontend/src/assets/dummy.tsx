import React from "react";
import {
  Home,
  ListChecks,
  Home as HomeIcon,
  Flame,
  Edit2,
  Calendar,
  BarChart2,
} from "lucide-react";

// Form Controls
export const baseControlClasses =
  "w-full h-[38px] px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 focus:outline-none transition-colors duration-150";

export const selectControlClasses =
  "w-full h-[38px] pl-3 pr-8 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 focus:outline-none transition-colors duration-150 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748b%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_10px_center] bg-no-repeat";

export const priorityStyles: Record<string, string> = {
  Low: "!bg-emerald-50/80 !text-emerald-700 !border-emerald-200 dark:!bg-emerald-950/30 dark:!text-emerald-400 dark:!border-emerald-800/80",
  Medium: "!bg-amber-50/80 !text-amber-700 !border-amber-200 dark:!bg-amber-950/30 dark:!text-amber-400 dark:!border-amber-800/80",
  High: "!bg-rose-50/80 !text-rose-700 !border-rose-200 dark:!bg-rose-950/30 dark:!text-rose-400 dark:!border-rose-800/80",
};

// Default Task
export const DEFAULT_TASK = {
  title: "",
  description: "",
  priority: "Low" as "Low" | "Medium" | "High",
  dueDate: "",
  completed: "No",
  id: null as string | null,
  originalEstimate: 0,
  labels: [] as string[],
  reporter: null as string | null,
};

// Sidebar Menu Items
export const menuItems = [
  { text: "Dashboard", path: "/", icon: <Home className="w-5 h-5" /> },
  { text: "Backlog", path: "/backlog", icon: <ListChecks className="w-5 h-5" /> },
  { text: "Active Sprint", path: "/active-sprint", icon: <Flame className="w-5 h-5" /> },
  { text: "Calendar", path: "/calendar", icon: <Calendar className="w-5 h-5" /> },
  { text: "Reports", path: "/reports", icon: <BarChart2 className="w-5 h-5" /> },
];

// Layout & Dashboard UI Helpers
export const WRAPPER = "w-full space-y-6";
export const HEADER =
  "flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3";
export const ADD_BUTTON =
  "flex items-center gap-2 cursor-pointer bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white px-4 py-2 rounded-lg shadow-2xs transition-colors w-full md:w-auto justify-center text-sm font-semibold";
export const STATS_GRID =
  "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6";
export const STAT_CARD =
  "p-3 md:p-4 rounded-xl bg-white shadow-sm border hover:shadow-md transition-all duration-300 min-w-0";
export const ICON_WRAPPER = "p-1.5 md:p-2 rounded-lg";
export const VALUE_CLASS = "text-lg md:text-2xl font-bold truncate";
export const LABEL_CLASS = "text-xs text-gray-500 truncate";

// KPI Stats definitions
export const STATS = [
  {
    key: "total",
    label: "Total Tasks",
    icon: HomeIcon,
    iconColor: "bg-sky-100 text-sky-600",
    valueKey: "total",
    gradient: true,
  },
  {
    key: "lowPriority",
    label: "Low Priority",
    icon: Flame,
    iconColor: "bg-green-100 text-green-600",
    borderColor: "border-green-100",
    valueKey: "lowPriority",
    textColor: "text-green-600",
  },
  {
    key: "mediumPriority",
    label: "Medium Priority",
    icon: Flame,
    iconColor: "bg-orange-100 text-orange-600",
    borderColor: "border-orange-100",
    valueKey: "mediumPriority",
    textColor: "text-orange-600",
  },
  {
    key: "highPriority",
    label: "High Priority",
    icon: Flame,
    iconColor: "bg-red-100 text-red-600",
    borderColor: "border-red-100",
    valueKey: "highPriority",
    textColor: "text-red-600",
  },
];

// Empty State
export const EMPTY_STATE = {
  wrapper:
    "p-6 bg-white rounded-xl shadow-sm border border-sky-100 text-center",
  iconWrapper:
    "w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4",
  btn: "px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors",
};

// Task Actions Menu
export const MENU_OPTIONS = [
  {
    action: "edit",
    label: "Edit Task",
    icon: <Edit2 size={14} className="text-sky-600" />,
  },
];
