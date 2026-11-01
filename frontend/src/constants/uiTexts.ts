export const BACKLOG_TEXTS = {
  PAGE_TITLE: "Backlog Planning",
  PAGE_SUBTITLE:
    "Plan sprints, organize epics, and triage the project backlog.",
  BTN_CREATE_SPRINT: "Create Sprint",
  FILTER_EPICS: "Epics:",
  EPICS_FILTER_ALL: "All Epics",
  BTN_NEW_EPIC: "New Epic",
  STATUS_ACTIVE: "Active",
  STATUS_COMPLETED: "Completed",
  STATUS_PLANNED: "Planned",
  LABEL_GOAL: "Goal",
  METRIC_ISSUES: "Issues",
  BTN_START_SPRINT: "Start Sprint",
  BTN_COMPLETE_SPRINT: "Complete Sprint",
  TOOLTIP_CLOSE_SPRINT: "Close Sprint",
  EMPTY_SPRINT_TASKS:
    "Drag issues here or use inline creator below to plan tasks.",
  INLINE_CREATOR_SAVE: "Save",
  BTN_CREATE_ISSUE: "Create Issue",
  HEADER_BACKLOG_ISSUES: "Backlog Issues",
  EMPTY_BACKLOG_TASKS:
    "No tasks inside backlog. Use inline creator below to add.",

  // Create Sprint Modal
  MODAL_NEW_SPRINT_TITLE: "New planned Sprint",
  LABEL_SPRINT_NAME: "Sprint Name",
  PLACEHOLDER_SPRINT_NAME: "e.g. Sprint 2",
  BTN_CANCEL: "Cancel",

  // Start Sprint Modal
  MODAL_START_SPRINT_TITLE: "Start Sprint",
  LABEL_START_DATE: "Start Date",
  LABEL_END_DATE: "End Date",
  LABEL_SPRINT_GOAL: "Sprint Goal",
  PLACEHOLDER_SPRINT_GOAL: "What is this sprint's objective?",
  BTN_START: "Start",

  // Close Sprint Modal
  MODAL_CLOSE_SPRINT_TITLE: "Close Sprint",
  MODAL_CLOSE_SPRINT_DESC:
    "Are you sure you want to close this Sprint? All incomplete tasks will return to the backlog.",

  // Create Epic Modal
  MODAL_CREATE_EPIC_TITLE: "Create Epic",
  LABEL_EPIC_NAME: "Epic Name",
  PLACEHOLDER_EPIC_NAME: "e.g. Mobile App Support",
  LABEL_THEME_COLOR: "Theme Color",
  LABEL_DESCRIPTION: "Description",
  PLACEHOLDER_EPIC_DESC: "Summary of epic's goal...",

  // Epic Color names
  COLOR_SKY: "Sky Blue",
  COLOR_EMERALD: "Emerald Green",
  COLOR_VIOLET: "Violet Purple",
  COLOR_AMBER: "Amber Yellow",
  COLOR_ROSE: "Rose Red",
  COLOR_INDIGO: "Indigo Blue",
};

export const ACTIVE_SPRINT_TEXTS = {
  LABEL_ACTIVE: "Active",
  LABEL_GOAL: "Goal",
  BTN_COMPLETE_SPRINT: "Complete Sprint",
  FILTER_LABEL: "Filters",
  BTN_ONLY_MY_ISSUES: "Only My Issues",
  BTN_HIGH_PRIORITY: "High Priority Only",
  GROUP_BY_LABEL: "Group by",
  BTN_EPIC_SWIMLANES: "Epic Swimlanes",
  SWIMLANE_EPIC: "Epic",
  SWIMLANE_ISSUES: "Issues",
  SWIMLANE_UNASSIGNED: "Issues without Epics",
  EMPTY_ACTIVE_SPRINT_TITLE: "No Active Sprint",
  EMPTY_ACTIVE_SPRINT_DESC:
    "Sprint boards display issues belonging to your team's current active sprint. Get started by planning in your backlog.",
  BTN_GO_TO_BACKLOG: "Go to Backlog",

  // Complete Sprint Confirm Modal
  MODAL_COMPLETE_SPRINT_TITLE: "Complete Sprint",
  MODAL_COMPLETE_SPRINT_DESC:
    "Are you sure you want to complete this Sprint? All incomplete tasks will return to the backlog.",
  BTN_CONFIRM: "Confirm",
  BTN_CANCEL: "Cancel",
};

export const AUTH_TEXTS = {
  // Login
  LOGIN_WELCOME: "Welcome Back",
  LOGIN_SUBTITLE: "Sign in to continue to PlanMate",
  LOGIN_INPUT_EMAIL: "Email",
  LOGIN_INPUT_PASSWORD: "Password",
  LOGIN_REMEMBER_ME: "Remember Me",
  LOGIN_BTN: "Login In",
  LOGIN_NO_ACCOUNT: "Don't have an account?",
  LOGIN_BTN_REQUEST: "Request Access",

  // Signup
  SIGNUP_TITLE: "Create Account",
  SIGNUP_SUBTITLE: "Join your organization's PlanMate workspace",
  SIGNUP_SUCCESS_DEFAULT: "Registration request submitted successfully!",
  SIGNUP_BTN_BACK: "Go to Login",
  SIGNUP_INPUT_NAME: "Full Name",
  SIGNUP_PLACEHOLDER_NAME: "John Doe",
  SIGNUP_INPUT_EMAIL: "Email Address",
  SIGNUP_PLACEHOLDER_EMAIL: "john@example.com",
  SIGNUP_INPUT_PASSWORD: "Password",
  SIGNUP_PLACEHOLDER_PASSWORD: "Minimum 8 characters",
  SIGNUP_INPUT_ORG: "Select Workspace Organization",
  SIGNUP_PLACEHOLDER_ORG: "Choose your company...",
  SIGNUP_BTN_SUBMIT: "Submit Access Request",
  SIGNUP_HAS_ACCOUNT: "Already have an account?",
  SIGNUP_BTN_LOGIN: "Log In",

  // Validation errors
  ERROR_FILL_DETAILS: "Please fill in all details, including organization.",
  ERROR_REGISTRATION_FAILED: "Registration failed. Please try again.",
};

import { Layers, ArrowDownCircle, Clock, Flame } from "lucide-react";

export const STATS_CONFIG = [
  {
    key: "total",
    label: "Total Tasks",
    icon: Layers,
    iconColor: "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400",
    borderColor: "border-sky-200/80 dark:border-sky-800/60",
    valueKey: "total" as const,
  },
  {
    key: "lowPriority",
    label: "Low Priority",
    icon: ArrowDownCircle,
    iconColor: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200/80 dark:border-emerald-800/60",
    valueKey: "lowPriority" as const,
  },
  {
    key: "mediumPriority",
    label: "Medium Priority",
    icon: Clock,
    iconColor: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200/80 dark:border-amber-800/60",
    valueKey: "mediumPriority" as const,
  },
  {
    key: "highPriority",
    label: "High Priority",
    icon: Flame,
    iconColor: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400",
    borderColor: "border-rose-200/80 dark:border-rose-800/60",
    valueKey: "highPriority" as const,
  },
];

export const EPIC_COLORS: Record<string, string> = {
  sky: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  violet: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-850",
  amber: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  rose: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-850",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
};

export const CALENDAR_TEXTS = {
  MONTH_NAMES: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  WEEKDAY_NAMES: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

export const KANBAN_TEXTS = {
  NO_ISSUES: "No issues in this status",
  LOADING_BOARD: "Loading board tasks...",
  LOADING_ANALYTICS: "Loading analytics...",
  TOTAL_ISSUES: "Total Issues",
};

export const CALENDAR_UI_TEXTS = {
  NO_TASKS_SCHEDULED: "No tasks scheduled for this day.",
  ALL_TASKS_DEADLINES: "All tasks have deadlines!",
  ADD_TASK_FOR_DAY: "Add task for this day",
  INBOX_TITLE: "Unscheduled Tasks",
  INBOX_SUBTITLE: "Inbox",
};

export const REPORT_TABLE_TEXTS = {
  COL_KEY: "Work item key",
  COL_TYPE: "Work type",
  COL_PRIORITY: "Work item priority",
  COL_SUMMARY: "Issue summary",
  COL_STATUS: "Status",
  COL_ASSIGNEE: "Assignee",
  EMPTY_REPORTS: "No work items match your report filter criteria",
  BTN_EXPORT_CSV: "Export CSV",
  TITLE: "Work item details",
  SUBTITLE: "Inspect all underlying tasks matching current filters",
};

export const ORG_MEMBERS_TEXTS = {
  COL_NAME: "User Name",
  COL_EMAIL: "Email",
  COL_ROLE: "Role",
  COL_SOLVED: "Solved Tickets",
  COL_STATUS: "Access Status",
  COL_ACTIONS: "Actions",
  EMPTY_MEMBERS: "No members found",
  FILTER_ALL_ROLES: "All Roles",
  FILTER_ORG_ADMIN: "Org Admin",
  FILTER_MEMBER: "Member",
  FILTER_ALL_STATUSES: "All Statuses",
  FILTER_ACTIVE: "Approved (Active)",
  FILTER_PENDING: "Pending Approval",
  FILTER_REJECTED: "Access Rejected",
  LABEL_SOLVED: "Solved",
};

export const PAGINATION_TEXTS = {
  PREVIOUS: "Previous",
  NEXT: "Next",
  SHOWING: "Showing",
  TO: "to",
  OF: "of",
  PAGE: "Page",
  RESULTS: "results",
};

export const SUBSCRIPTION_EXPIRED_TEXTS = {
  MODAL_BADGE: "Subscription Expired",
  MODAL_TITLE: "Plan Renewal Required",
  MODAL_DESCRIPTION:
    "Your organization workspace plan has expired. Project boards, backlogs, sprints, and reports are safely preserved, but board operations are suspended until your subscription is renewed.",
  BTN_RENEW_PLAN: "Renew Subscription",
  BTN_GO_PROFILE: "Account Settings",
  PLAN_LABEL: "Previous Plan",
  STATUS_LABEL: "Status",
  STATUS_EXPIRED: "Expired",
  SIDEBAR_LOCKED_TOOLTIP: "Plan expired — renewal required",
  BILLING_EXPIRED_BANNER_TITLE: "Your workspace plan is currently expired",
  BILLING_EXPIRED_BANNER_DESC:
    "Select a plan below and renew your subscription to instantly unlock all workspace features, boards, and team access.",
  MEMBER_LOGIN_TITLE: "Workspace Subscription Inactive",
  MEMBER_LOGIN_SUBTITLE:
    "Your organization's subscription has expired. Please contact your workspace administrator to renew the plan and restore access.",
  MEMBER_ADMIN_CONTACT_TITLE: "Workspace Administrator:",
  MEMBER_DISMISS: "Dismiss",
};

