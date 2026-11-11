export const API_ROUTES = {
  AUTH: {
    LOGIN: "/api/user/login",
    REGISTER: "/api/user/register",
    ME: "/api/user/me",
    PROFILE: "/api/user/profile",
    PASSWORD: "/api/user/password",
  },
  ORGANIZATION: {
    BASE: "/api/organization",
    MEMBERS: "/api/organization/members",
    USERS: "/api/organization/users",
    STATUSES: "/api/organization/statuses",
    STATUS_DELETE: (statusName: string) =>
      `/api/organization/statuses/${encodeURIComponent(statusName)}`,
    BOARD_FEATURES: "/api/organization/board-features",
    PRIORITIES: "/api/organization/priorities",
    PRIORITY_DELETE: (priorityName: string) =>
      `/api/organization/priorities/${encodeURIComponent(priorityName)}`,
    CUSTOM_FIELDS: "/api/organization/custom-fields",
    CUSTOM_FIELD_DELETE: (fieldId: string) =>
      `/api/organization/custom-fields/${encodeURIComponent(fieldId)}`,
    ALL: "/api/organization/all",
    ONBOARD: "/api/organization/onboard",
    PUBLIC_LIST: "/api/organization/public-list",
    ADMIN_BY_ID: (id: string) => `/api/organization/${id}/admin`,
    STATUS_BY_ID: (id: string) => `/api/organization/${id}/status`,
    SUBSCRIPTION_BY_ID: (id: string) => `/api/organization/${id}/subscription`,
    RESET_ADMIN_PASSWORD: (id: string) => `/api/organization/${id}/reset-admin-password`,
    DELETE_BY_ID: (id: string) => `/api/organization/${id}`,
    USER_STATUS_UPDATE: (userId: string) =>
      `/api/organization/users/${userId}/status`,
    SUBSCRIPTION: "/api/organization/subscription",
    SUBSCRIBE: "/api/organization/subscribe",
    BILLING_HISTORY: "/api/organization/billing-history",
    ALL_PAYMENTS: "/api/organization/admin/payments",
  },
  PLANS: {
    BASE: "/api/plans",
    ADMIN_ALL: "/api/plans/admin/all",
    BY_ID: (id: string) => `/api/plans/${id}`,
  },
  TASKS: {
    BASE: "/api/tasks/gp",
    BY_ID: (id: string) => `/api/tasks/${id}/gp`,
    ANALYTICS: "/api/tasks/gp/analytics",
    ADD_COMMENT: (id: string) => `/api/tasks/${id}/comments`,
    DELETE_COMMENT: (id: string, commentId: string) =>
      `/api/tasks/${id}/comments/${commentId}`,
    LOG_WORK: (id: string) => `/api/tasks/${id}/worklogs`,
    DELETE_WORKLOG: (id: string, workLogId: string) =>
      `/api/tasks/${id}/worklogs/${workLogId}`,
    WORKLOG_USERS: "/api/tasks/gp/worklogs/users",
    WORKLOG_USER_DETAILS: (userId: string) =>
      `/api/tasks/gp/worklogs/users/${userId}`,
    WORKLOG_EXPORT: "/api/tasks/gp/worklogs/export",
    LINK: (id: string) => `/api/tasks/${id}/links`,
    UNLINK: (id: string, linkId: string) => `/api/tasks/${id}/links/${linkId}`,
  },
  SPRINTS: {
    BASE: "/api/sprints",
    BY_ID: (id: string) => `/api/sprints/${id}`,
  },
  EPICS: {
    BASE: "/api/epics",
    BY_ID: (id: string) => `/api/epics/${id}`,
  },
  NOTIFICATIONS: {
    BASE: "/api/notifications",
    READ_ALL: "/api/notifications/read-all",
    READ_BY_ID: (id: string) => `/api/notifications/${id}/read`,
  },
  BOARDS: {
    BASE: "/api/boards",
    BY_ID: (id: string) => `/api/boards/${id}`,
  },
  ROLES: {
    BASE: "/api/roles",
    BY_ID: (id: string) => `/api/roles/${id}`,
    ASSIGN: (userId: string) => `/api/roles/assign/${userId}`,
  },
};
