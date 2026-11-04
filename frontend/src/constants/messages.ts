export const TOAST_MESSAGES = {
  // Sprint
  SPRINT_CREATE_SUCCESS: "Sprint created successfully!",
  SPRINT_CREATE_ERROR: "Failed to create sprint.",
  SPRINT_START_SUCCESS: "Sprint started! Active Scrum Board is live.",
  SPRINT_START_ERROR: "Failed to start sprint.",
  SPRINT_COMPLETE_SUCCESS: "Sprint completed successfully!",
  SPRINT_COMPLETE_ERROR: "Failed to complete sprint.",
  SPRINT_DELETE_SUCCESS: "Sprint closed.",
  SPRINT_DELETE_ERROR: "Failed to close sprint.",

  // Epic
  EPIC_CREATE_SUCCESS: "Epic created successfully!",
  EPIC_CREATE_ERROR: "Failed to create epic.",

  // Task / Issue Move
  TASK_MOVE_SPRINT: "Task added to Sprint.",
  TASK_MOVE_BACKLOG: "Task moved to Backlog.",
  TASK_MOVE_ERROR: "Failed to reassign task destination.",
  ISSUE_CREATE_SUCCESS: "Issue created!",
  ISSUE_CREATE_ERROR: "Failed to create issue.",
  BACKLOG_LOAD_ERROR: "Failed to load backlog board details.",
  ACTIVE_SPRINT_LOAD_ERROR: "Failed to load active sprint data.",
  TASK_STATUS_UPDATE_SUCCESS: (status: string) =>
    `Task status updated to ${status}`,
  TASK_STATUS_UPDATE_ERROR: "Failed to update status.",

  // Kanban / Blocks
  TASK_BLOCKED_ERROR: (blockTitles: string) =>
    `Cannot move task. It is blocked by: ${blockTitles}`,

  // Auth / Login / Signup
  AUTH_SESSION_RESTORED: "Session restored. Redirecting...",
  AUTH_REMEMBER_ME_REQUIRED: 'You must enable "Remember Me" to login',
  AUTH_LOGIN_SUCCESS: "Login successfull Redirecting...",
  AUTH_LOGIN_FAILED: "Login failed",
  AUTH_ORG_LIST_ERROR: "Failed to fetch organizations list.",

  // Workspace Settings
  WORKSPACE_LOAD_ERROR: "Failed to load workspace details.",
  WORKSPACE_NAME_REQUIRED: "Workspace name cannot be empty",
  WORKSPACE_STATUS_ADD_SUCCESS: "Custom status added successfully!",
  WORKSPACE_STATUS_ADD_ERROR: "Failed to add status.",
  WORKSPACE_STATUS_DEL_SUCCESS: "Custom status deleted successfully!",
  WORKSPACE_STATUS_DEL_ERROR: "Failed to delete status.",
  WORKSPACE_UPDATE_SUCCESS: "Workspace settings updated successfully!",
  WORKSPACE_UPDATE_ERROR: "Failed to update workspace settings.",
  WORKSPACE_FEATURE_UPDATE_SUCCESS: "Board feature setting updated",
  WORKSPACE_FEATURE_UPDATE_ERROR: "Failed to update board feature",
  WORKSPACE_PRIORITY_EMPTY_ERROR: "Priority name cannot be empty",
  WORKSPACE_PRIORITY_EXISTS_ERROR: "This priority level already exists",
  WORKSPACE_PRIORITY_ADD_SUCCESS: "Priority added successfully",
  WORKSPACE_PRIORITY_ADD_ERROR: "Failed to add priority",
  WORKSPACE_PRIORITY_DEL_SUCCESS: "Priority deleted successfully",
  WORKSPACE_PRIORITY_DEL_ERROR: "Failed to delete priority",
  WORKSPACE_FIELD_NAME_REQUIRED: "Field name is required",
  WORKSPACE_FIELD_DROPDOWN_OPTION_REQUIRED: "Please add at least one option for dropdown field",
  WORKSPACE_FIELD_OPTION_EXISTS: "Option already exists",
  WORKSPACE_FIELD_ADD_SUCCESS: "Custom field created",
  WORKSPACE_FIELD_ADD_ERROR: "Failed to create custom field",
  WORKSPACE_FIELD_DEL_SUCCESS: "Custom field removed",
  WORKSPACE_FIELD_DEL_ERROR: "Failed to delete custom field",

  // Member Onboarding
  MEMBER_FIELDS_REQUIRED: "Please fill all member onboarding fields",
  MEMBER_NAME_REQUIRED: "Please enter the member's full name",
  MEMBER_EMAIL_REQUIRED: "Please enter a valid email address",
  MEMBER_PASSWORD_MIN_LENGTH: "Password must be at least 8 characters long",
  MEMBER_ONBOARD_SUCCESS: (name: string) =>
    `Member ${name} onboarded successfully!`,
  MEMBER_ONBOARD_ERROR: "Failed to add member",
  MEMBER_STATUS_GRANT_SUCCESS: (name: string, status: string) =>
    `Access request for ${name} is now updated to ${status}.`,
  MEMBER_STATUS_UPDATE_SUCCESS: "User status updated successfully!",
  MEMBER_STATUS_UPDATE_ERROR: "Failed to update user status",

  // Profile
  PROFILE_LOAD_ERROR: "Unable to load the profile",
  PROFILE_UPDATE_SUCCESS: "Profile Updated",
  PROFILE_UPDATE_ERROR: "Profile update failed",
  PASSWORD_MISMATCH: "Password do not match",
  PASSWORD_CHANGE_SUCCESS: "Password Changed",
  PASSWORD_CHANGE_ERROR: "Password change failed",

  // Task Details
  COMMENT_ADD_SUCCESS: "Comment added successfully!",
  COMMENT_ADD_ERROR: "Failed to add comment",
  COMMENT_DEL_SUCCESS: "Comment deleted successfully!",
  COMMENT_DEL_ERROR: "Failed to delete comment",
  LINK_EXISTS_WARN: "This task is already linked with the selected relation.",
  LINK_ADD_SUCCESS: "Issue dependency link added!",
  LINK_ADD_ERROR: "Failed to add link",
  LINK_REMOVE_SUCCESS: "Link removed successfully!",
  LINK_REMOVE_ERROR: "Failed to remove link",
  TITLE_REQUIRED_ERROR: "Title summary is required.",
  TASK_UPDATE_SUCCESS: "Task updated successfully!",
  TASK_UPDATE_ERROR: "Failed to update task.",
  SUBTASK_DRAFT_SUCCESS: "Subtask draft added. Remember to click Save Changes!",
  WORKLOG_HOURS_INVALID: "Please enter a valid number of hours (> 0)",
  WORKLOG_ADD_SUCCESS: "Work logged successfully!",
  WORKLOG_ADD_ERROR: "Failed to log work",

  // SysAdmin Orgs
  SYSADMIN_FETCH_ORGS_ERROR: "Failed to fetch organizations.",
  SYSADMIN_ONBOARD_REQUIRED_FIELDS:
    "Please fill in organization name, admin name, and admin email.",
  SYSADMIN_INVALID_ADMIN_EMAIL: "Please enter a valid admin email address.",
  SYSADMIN_ONBOARD_SUCCESS: "Organization onboarded successfully!",
  SYSADMIN_ONBOARD_ERROR: "Failed to onboard organization.",
  SYSADMIN_ORG_NAME_REQUIRED: "Organization name cannot be empty.",
  SYSADMIN_ORG_UPDATE_SUCCESS: "Successfully updated organization details!",
  SYSADMIN_ORG_UPDATE_ERROR: "Failed to update organization.",
  SYSADMIN_ORG_RESTORE_SUCCESS: (name: string) =>
    `Successfully restored organization "${name}".`,
  SYSADMIN_ORG_RESTORE_ERROR: "Failed to restore organization.",
  SYSADMIN_ORG_DEACTIVATE_SUCCESS: (name: string) =>
    `Successfully deactivated organization "${name}".`,
  SYSADMIN_ORG_DEACTIVATE_ERROR: "Failed to deactivate organization.",
  SYSADMIN_ORG_DELETE_SUCCESS: (name: string) =>
    `Successfully deleted organization "${name}".`,
  SYSADMIN_ORG_DELETE_ERROR: "Failed to delete organization.",
  SYSADMIN_RESET_PASSWORD_SUCCESS: (name: string) =>
    `Successfully generated temporary credentials for "${name}".`,
  SYSADMIN_RESET_PASSWORD_ERROR: "Failed to reset admin credentials.",
};

export const CONSOLE_ERRORS = {
  FETCH_PAGINATED_TASKS: "Error fetching paginated list tasks:",
  FETCH_MEMBERS_DASHBOARD: "Error fetching members inside Dashboard:",
  FETCH_ORG_DETAILS: "Error fetching org details:",
  FETCH_ORG_USERS: "Error fetching organization users:",
  LOAD_ROSTER: "Error loading roster:",
  CHECK_STATUS_COUNTS: "Error checking status task counts:",
  LOAD_SETTINGS: "Error loading settings:",
  FETCH_TASKS_LINKING: "Error fetching tasks for linking:",
  FETCH_WORKSPACE_DETAILS: "Error fetching workspace details:",
  SET_STATUS_ERROR: "Error setting status:",
  FETCH_DEPENDENCIES_MODAL: "Error fetching dependencies inside TaskModal:",
  MOVE_TASK_ERROR: "Error moving task:",
  UPDATE_STATUS_DROP: "Error updating status on drop:",
  FETCH_NOTIFICATIONS: "Error fetching notifications:",
  MARK_ALL_READ: "Error marking all read:",
  MARK_READ: "Error marking read:",
  FETCH_ORG_NAME: "Error fetching organization name:",
  CALENDAR_LOAD_STATUSES: "Failed to load statuses in calendar page:",
};
