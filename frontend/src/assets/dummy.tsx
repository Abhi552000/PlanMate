import React from "react";
import {
  User,
  Mail,
  Home,
  ListChecks,
  CheckCircle2,
  Lock,
  Home as HomeIcon,
  Flame,
  SortDesc,
  SortAsc,
  Award,
  Edit2,
  Calendar,
  BarChart2,
} from "lucide-react";

// FRONTEND CONSTANTS
export const baseControlClasses =
  "w-full h-[38px] px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 focus:outline-none transition-colors duration-150";

export const selectControlClasses =
  "w-full h-[38px] pl-3 pr-8 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 focus:outline-none transition-colors duration-150 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2364748b%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_10px_center] bg-no-repeat";

export const priorityStyles: Record<string, string> = {
  Low: "!bg-emerald-50/80 !text-emerald-700 !border-emerald-200 dark:!bg-emerald-950/30 dark:!text-emerald-400 dark:!border-emerald-800/80",
  Medium: "!bg-amber-50/80 !text-amber-700 !border-amber-200 dark:!bg-amber-950/30 dark:!text-amber-400 dark:!border-amber-800/80",
  High: "!bg-rose-50/80 !text-rose-700 !border-rose-200 dark:!bg-rose-950/30 dark:!text-rose-400 dark:!border-rose-800/80",
};

// data/defaultTask.js
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

// LOGIN CSS
export const INPUTWRAPPER =
  "flex items-center border border-sky-100 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200";
export const BUTTON_CLASSES =
  "w-full bg-gradient-to-r cursor-pointer from-cyan-500 to-sky-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2";

// PROFILE CSS
export const INPUT_WRAPPER =
  "flex items-center border border-sky-100 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200";
export const FULL_BUTTON =
  "w-full bg-gradient-to-r from-cyan-500 to-sky-600 text-white py-2.5 rounded-lg hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2";
export const SECTION_WRAPPER =
  "bg-white rounded-xl shadow-sm border border-sky-100 p-6";
export const BACK_BUTTON =
  "flex items-center cursor-pointer text-gray-600 hover:text-sky-600 mb-8 transition-colors duration-200";
export const DANGER_BTN =
  "w-full text-red-600 border border-red-200 py-2.5 rounded-lg hover:bg-red-50 transition-colors duration-200 cursor-pointer";

export const personalFields = [
  { name: "name", type: "text", placeholder: "Full Name", icon: User },
  { name: "email", type: "email", placeholder: "Email", icon: Mail },
];

export const securityFields = [
  { name: "current", placeholder: "Current Password" },
  { name: "new", placeholder: "New Password" },
  { name: "confirm", placeholder: "Confirm Password" },
];

// SIDEBAR
export const menuItems = [
  { text: "Dashboard", path: "/", icon: <Home className="w-5 h-5" /> },
  { text: "Backlog", path: "/backlog", icon: <ListChecks className="w-5 h-5" /> },
  { text: "Active Sprint", path: "/active-sprint", icon: <Flame className="w-5 h-5" /> },
  { text: "Calendar", path: "/calendar", icon: <Calendar className="w-5 h-5" /> },
  { text: "Reports", path: "/reports", icon: <BarChart2 className="w-5 h-5" /> },
];

export const SIDEBAR_CLASSES = {
  desktop:
    "hidden md:flex flex-col fixed top-[52px] left-0 h-[calc(100vh-52px)] bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800 shadow-xs z-30 transition-all duration-300",
  mobileButton:
    "fixed md:hidden top-20 left-4 z-40 bg-sky-600 text-white p-2.5 rounded-full shadow-lg hover:bg-sky-700 transition-all duration-200",
  mobileDrawerBackdrop: "fixed inset-0 bg-black/40 backdrop-blur-sm",
  mobileDrawer:
    "absolute top-0 left-0 w-64 h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-r border-sky-100 dark:border-gray-800 shadow-lg z-50 p-4 flex flex-col space-y-6",
};

export const LINK_CLASSES = {
  base: "group flex items-center px-4 py-3 rounded-xl transition-all duration-300",
  active:
    "bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-950/20 dark:to-cyan-950/20 border-l-4 border-sky-500 text-sky-700 dark:text-sky-400 font-medium shadow-sm",
  inactive: "hover:bg-sky-50/50 dark:hover:bg-sky-950/20 text-gray-600 dark:text-gray-400 hover:text-sky-700 dark:hover:text-sky-300",
  icon: "transition-transform duration-300 group-hover:scale-110 text-sky-500",
  text: "text-sm font-medium ml-2 whitespace-nowrap",
};

export const TIP_CARD = {
  container:
    "bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-950/20 dark:to-cyan-950/20 rounded-xl p-4 border border-sky-100 dark:border-sky-900/50",
  iconWrapper: "p-2 bg-sky-100 dark:bg-sky-900/50 rounded-lg",
  title: "text-sm font-semibold text-gray-800 dark:text-gray-200",
  text: "text-xs text-gray-600 dark:text-gray-400 mt-1",
};

// SIGNUP
export const FIELDS = [
  { name: "name", type: "text", placeholder: "Full Name", icon: User },
  { name: "email", type: "email", placeholder: "Email", icon: Mail },
  { name: "password", type: "password", placeholder: "Password", icon: Lock },
];

export const Inputwrapper =
  "flex items-center border border-sky-100 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200";
export const BUTTONCLASSES =
  "w-full cursor-pointer bg-gradient-to-r from-cyan-500 to-sky-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2";
export const MESSAGE_SUCCESS =
  "bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 border border-green-100";
export const MESSAGE_ERROR =
  "bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100";

// TASK ITEM
export const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: "border-green-500 bg-green-50/50 text-green-700",
    medium: "border-sky-500 bg-sky-50/50 text-sky-600",
    high: "border-cyan-800 bg-cyan-50/50 text-cyan-800",
  };
  return (
    colors[priority?.toLowerCase()] ||
    "border-gray-500 bg-gray-50/50 text-gray-700"
  );
};

export const getPriorityBadgeColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: "bg-green-100 text-green-900",
    medium: "bg-sky-100 text-sky-900",
    high: "bg-cyan-300 text-cyan-900",
  };
  return colors[priority?.toLowerCase()] || "bg-gray-100 text-gray-700";
};

// DASHBOARD
// UI Constants
export const WRAPPER = "w-full space-y-6";
export const HEADER =
  "flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3";
export const ADD_BUTTON =
  "flex items-center gap-2 cursor-pointer bg-gradient-to-r from-cyan-500 to-sky-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-full md:w-auto justify-center text-sm md:text-base";
export const STATS_GRID =
  "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6";
export const STAT_CARD =
  "p-3 md:p-4 rounded-xl bg-white shadow-sm border hover:shadow-md transition-all duration-300 min-w-0";
export const ICON_WRAPPER = "p-1.5 md:p-2 rounded-lg";
export const VALUE_CLASS = "text-lg md:text-2xl font-bold truncate";
export const LABEL_CLASS = "text-xs text-gray-500 truncate";

// Stats definitions
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

// Filter options
export const FILTER_OPTIONS = ["all", "today", "week", "high", "medium", "low"];
export const FILTER_LABELS: Record<string, string> = {
  all: "All Tasks",
  today: "Today's Tasks",
  week: "This Week",
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

// Empty state
export const EMPTY_STATE = {
  wrapper:
    "p-6 bg-white rounded-xl shadow-sm border border-sky-100 text-center",
  iconWrapper:
    "w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4",
  btn: "px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 text-white rounded-lg text-sm font-medium",
};

// Filter UI Constants
export const FILTER_WRAPPER =
  "flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-transparent dark:border-gray-800";
export const SELECT_CLASSES =
  "px-3 py-2 border border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 md:hidden text-sm";
export const TABS_WRAPPER =
  "hidden md:flex space-x-1 bg-sky-50 dark:bg-gray-800 p-1 rounded-lg";
export const TAB_BASE =
  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer";
export const TAB_ACTIVE = "bg-white dark:bg-gray-700 text-sky-700 dark:text-sky-300 shadow-sm border border-transparent dark:border-gray-600 font-semibold";
export const TAB_INACTIVE = "text-gray-600 dark:text-gray-400 hover:bg-sky-100/50 dark:hover:bg-sky-900/50";

// COMPLETE TASK
export const SORT_OPTIONS = [
  { id: "newest", label: "Newest", icon: <SortDesc className="w-3 h-3" /> },
  { id: "oldest", label: "Oldest", icon: <SortAsc className="w-3 h-3" /> },
  { id: "priority", label: "Priority", icon: <Award className="w-3 h-3" /> },
];

// CSS class groups
export const CT_CLASSES = {
  page: "p-4 md:p-6 min-h-screen",
  header:
    "flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-3 md:gap-4",
  titleWrapper: "flex-1 min-w-0",
  title:
    "text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 truncate",
  subtitle: "text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7 md:ml-8",
  sortContainer: "w-full md:w-auto mt-2 md:mt-0",
  sortBox:
    "flex items-center justify-between bg-white dark:bg-gray-900 p-2 md:p-3 rounded-xl shadow-sm border border-sky-100 dark:border-gray-800 w-full md:w-auto",
  filterLabel: "flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium",
  select:
    "px-2 py-1 md:px-3 md:py-2 border border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 md:hidden text-xs md:text-sm",
  btnGroup: "hidden md:flex space-x-1 bg-sky-50 dark:bg-gray-800 p-1 rounded-lg ml-2 md:ml-3",
  btnBase:
    "px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1",
  btnActive: "bg-white dark:bg-gray-700 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-100 dark:border-gray-600",
  btnInactive: "text-gray-600 dark:text-gray-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-100/50 dark:hover:bg-sky-900/50",
  list: "space-y-3 md:space-y-4",
  emptyState:
    "p-4 md:p-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-sky-100 dark:border-gray-800 text-center",
  emptyIconWrapper:
    "w-12 h-12 md:w-16 md:h-16 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4",
  emptyTitle: "text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2",
  emptyText: "text-xs md:text-sm text-gray-500 dark:text-gray-400",
};

// constants/cssClasses.js
export const layoutClasses = {
  container: "p-6 min-h-screen",
  headerWrapper:
    "flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4",
  sortBox:
    "flex items-center justify-between bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-sky-100 dark:border-gray-800 w-full md:w-auto",
  select:
    "px-3 py-2 border border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 md:hidden text-sm",
  tabWrapper: "hidden md:flex space-x-1 bg-sky-50 dark:bg-gray-800 p-1 rounded-lg ml-3",
  tabButton: (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
      active
        ? "bg-white dark:bg-gray-750 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-100 dark:border-gray-650"
        : "text-gray-600 dark:text-gray-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-100/50 dark:hover:bg-sky-900/50"
    }`,
  addBox:
    "hidden md:block p-5 border-2 border-dashed border-sky-200 dark:border-gray-750 rounded-xl hover:border-sky-400 transition-colors cursor-pointer mb-6 bg-sky-50/50 dark:bg-sky-950/10 group",
  emptyState:
    "p-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-sky-100 dark:border-gray-800 text-center",
  emptyIconBg:
    "w-16 h-16 bg-sky-100 dark:bg-sky-900/50 rounded-full flex items-center justify-center mx-auto mb-4",
  emptyBtn:
    "px-4 py-2 bg-sky-100 hover:bg-sky-200 dark:bg-sky-900 dark:hover:bg-sky-850 text-sky-700 dark:text-sky-300 rounded-lg text-sm font-medium transition-colors",
};

// TASK ITEM
// Menu options for task actions
export const MENU_OPTIONS = [
  {
    action: "edit",
    label: "Edit Task",
    icon: <Edit2 size={14} className="text-sky-600" />,
  },
];

// CSS class groups for TaskItem
export const TI_CLASSES = {
  wrapper:
    "group p-4 sm:p-5 rounded-xl shadow-sm bg-white dark:bg-gray-900 border-l-4 hover:shadow-md transition-all duration-300 border border-sky-100 dark:border-gray-800 text-gray-850 dark:text-gray-200",
  leftContainer: "flex items-start gap-2 sm:gap-3 flex-1 min-w-0",
  completeBtn:
    "mt-0.5 sm:mt-1 p-1 sm:p-1.5 rounded-full hover:bg-sky-100 dark:hover:bg-sky-950 transition-colors duration-300",
  checkboxIconBase: "w-4 h-4 sm:w-5 sm:h-5",
  titleBase: "text-base sm:text-lg font-medium truncate",
  priorityBadge: "text-xs px-2 py-0.5 rounded-full shrink-0",
  description: "text-sm text-gray-500 dark:text-gray-400 mt-1 truncate",
  subtasksContainer:
    "mt-3 sm:mt-4 space-y-2 sm:space-y-3 bg-sky-50/30 dark:bg-sky-950/10 p-2 sm:p-3 rounded-lg border border-sky-100 dark:border-gray-800",
  progressBarBg: "h-1.5 bg-sky-100 dark:bg-gray-800 rounded-full overflow-hidden",
  progressBarFg:
    "h-full bg-gradient-to-r from-cyan-500 to-sky-600 transition-all duration-300",
  rightContainer: "flex flex-col items-end gap-2 sm:gap-3",
  menuButton:
    "p-1 sm:p-1.5 hover:bg-sky-100 dark:hover:bg-sky-950 rounded-lg text-gray-500 dark:text-gray-450 hover:text-sky-700 dark:hover:text-sky-350 transition-colors duration-200",
  menuDropdown:
    "absolute right-0 mt-1 w-40 sm:w-48 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl shadow-lg z-10 overflow-hidden animate-fadeIn",
  dateRow: "flex items-center gap-1.5 text-xs font-medium whitespace-nowrap text-gray-700 dark:text-gray-300",
  createdRow:
    "flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap",
};
