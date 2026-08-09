import React from "react";
import { ITask } from "./task";

export interface TaskModalHeaderProps {
  parentTask: any;
  taskData: any;
  handleBackToParent: () => void;
  onClose: () => void;
  setParentTask: (val: any) => void;
}

export interface TaskModalFooterProps {
  loading: boolean;
  parentTask: any;
  taskData: any;
  onClose: () => void;
  setParentTask: (val: any) => void;
}

export interface MetricCardsProps {
  metrics: {
    pendingCount: number;
    completedCount: number;
    completionRate: number;
    remainingPoints: number;
    completedPoints: number;
    totalCount: number;
  };
  activeTooltip?: string | null;
  setActiveTooltip?: (val: string | null) => void;
}

export interface ChartsSectionProps {
  burndownData: any[];
  priorityBreakdown: any[];
  metrics: {
    totalCount: number;
    completionRate: number;
    completedCount: number;
    pendingCount: number;
  };
  weeklyData: any[];
  tasks?: any[];
}

export interface WorkspaceBrandingFormProps {
  orgData: {
    name: string;
    description: string;
  };
  savingOrg: boolean;
  handleOrgChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleUpdateOrg: (e: React.FormEvent) => Promise<void>;
}

export interface CustomStatusesSettingsProps {
  statuses: string[];
  newStatus: string;
  setNewStatus: (val: string) => void;
  addingStatus: boolean;
  handleAddStatus: (e: React.FormEvent) => Promise<void>;
  handleOpenDeleteModal: (statusName: string) => void;
}

export interface ConfirmDeleteStatusModalProps {
  statusToDelete: string | null;
  isCheckingTasks: boolean;
  tasksCountForStatus: number | null;
  deletingStatus: string | null;
  setStatusToDelete: (val: string | null) => void;
  setTasksCountForStatus: (val: number | null) => void;
  handleDeleteStatus: (statusName: string) => Promise<void>;
}

export interface IssueLinkingSectionProps {
  linkType: "blocks" | "blocked by" | "relates to";
  setLinkType: (val: "blocks" | "blocked by" | "relates to") => void;
  targetTaskId: string;
  setTargetTaskId: (val: string) => void;
  workspaceTasks: any[];
  linking: boolean;
  links: any[];
  onAddLink: (e: React.FormEvent) => Promise<void>;
  onRemoveLink: (linkId: string) => Promise<void>;
  baseControlClasses: string;
}

export interface BacklogModalsProps {
  showCreateSprint: boolean;
  setShowCreateSprint: (val: boolean) => void;
  newSprintName: string;
  setNewSprintName: (val: string) => void;
  creatingSprint: boolean;
  handleCreateSprint: (e: React.FormEvent) => Promise<void>;
  showStartSprint: string | null;
  setShowStartSprint: (val: string | null) => void;
  startDate: string;
  setStartDate: (val: string) => void;
  endDate: string;
  setEndDate: (val: string) => void;
  startGoal: string;
  setStartGoal: (val: string) => void;
  startingSprint: boolean;
  handleStartSprint: (e: React.FormEvent) => Promise<void>;
  showCreateEpic: boolean;
  setShowCreateEpic: (val: boolean) => void;
  newEpicName: string;
  setNewEpicName: (val: string) => void;
  newEpicColor: string;
  setNewEpicColor: (val: string) => void;
  newEpicDesc: string;
  setNewEpicDesc: (val: string) => void;
  creatingEpic: boolean;
  handleCreateEpic: (e: React.FormEvent) => Promise<void>;
  confirmCompleteSprintId: string | null;
  setConfirmCompleteSprintId: (val: string | null) => void;
  completingSprint: boolean;
  handleConfirmCompleteSprint: () => Promise<void>;
  confirmDeleteSprintId: string | null;
  setConfirmDeleteSprintId: (val: string | null) => void;
  deletingSprint: boolean;
  handleConfirmDeleteSprint: () => Promise<void>;
}

export interface BacklogTaskRowProps {
  task: ITask;
  currentSprintId: string | null;
  onEdit: (task: ITask) => void;
  onMove: (taskId: string, targetSprintId: string | null) => void;
  sprints: any[];
}

export interface BacklogSprintAccordionProps {
  sprint: any;
  expandedSprintId: string | null;
  setExpandedSprintId: (val: string | null) => void;
  filteredTasks: any[];
  todo: number;
  progress: number;
  done: number;
  setShowStartSprint: (val: string | null) => void;
  setConfirmCompleteSprintId: (val: string | null) => void;
  setConfirmDeleteSprintId: (val: string | null) => void;
  handleMoveTask: (taskId: string, targetSprintId: string | null) => void;
  setSelectedTaskToEdit: (task: any) => void;
  setIsTaskModalOpen: (val: boolean) => void;
  activeInlineCreator: string | null;
  setActiveInlineCreator: (val: string | null) => void;
  inlineIssueType: string;
  setInlineIssueType: (val: string) => void;
  inlineTitle: string;
  setInlineTitle: (val: string) => void;
  handleCreateInlineIssue: (sprintId: string | null) => void;
  creatingInlineIssue: string | null;
  sprints: any[];
}

export interface BacklogTasksSectionProps {
  expandedSprintId: string | null;
  setExpandedSprintId: (val: string | null) => void;
  backlogTasks: any[];
  filterByEpic: (tasks: any[]) => any[];
  handleMoveTask: (taskId: string, targetSprintId: string | null) => void;
  setSelectedTaskToEdit: (task: any) => void;
  setIsTaskModalOpen: (val: boolean) => void;
  activeInlineCreator: string | null;
  setActiveInlineCreator: (val: string | null) => void;
  inlineIssueType: string;
  setInlineIssueType: (val: string) => void;
  inlineTitle: string;
  setInlineTitle: (val: string) => void;
  handleCreateInlineIssue: (sprintId: string | null) => void;
  creatingInlineIssue: string | null;
  sprints: any[];
}

export interface ActiveSprintHeaderProps {
  activeSprint: any;
  remainingDays: string | null;
  handleCompleteSprint: () => void;
}

export interface ActiveSprintFiltersProps {
  onlyMyIssues: boolean;
  setOnlyMyIssues: (val: boolean) => void;
  highPriorityOnly: boolean;
  setHighPriorityOnly: (val: boolean) => void;
  groupByEpic: boolean;
  setGroupByEpic: (val: boolean) => void;
}

export interface ConfirmCompleteSprintModalProps {
  showConfirmComplete: boolean;
  setShowConfirmComplete: (val: boolean) => void;
  completingSprint: boolean;
  handleConfirmComplete: () => Promise<void>;
}

export interface ActiveSprintBoardColumnProps {
  statuses: string[];
  sprintTasks: ITask[];
  handleUpdateStatus: (taskId: string, newStatus: string) => Promise<void>;
  setSelectedTaskToEdit: (task: ITask) => void;
  setIsTaskModalOpen: (val: boolean) => void;
}

export interface FilterOptions {
  searchQuery: string;
  selectedAssignee: string;
  selectedPriority: string;
  selectedStatus: string;
  selectedTimeframe: string;
}

export interface KanbanCardProps {
  task: ITask;
  col: string;
  columns: string[];
  navigate: (path: string) => void;
  handleDragStart: (e: React.DragEvent, taskId: string) => void;
  handleStatusTransition: (taskId: string, newStatus: string) => Promise<void>;
}

export interface KanbanColumnProps {
  col: string;
  columns: string[];
  colTasks: ITask[];
  activeOverColumn: string | null;
  handleDragOver: (e: React.DragEvent, col: string) => void;
  handleDragEnter: (e: React.DragEvent, col: string) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, col: string) => void;
  handleDragStart: (e: React.DragEvent, taskId: string) => void;
  handleStatusTransition: (taskId: string, newStatus: string) => Promise<void>;
  navigate: (path: string) => void;
}

import { INotification } from "./task";

export interface NotificationDropdownProps {
  notiOpen: boolean;
  setNotiOpen: React.Dispatch<React.SetStateAction<boolean>>;
  notifications: INotification[];
  unreadCount: number;
  handleMarkAllRead: () => Promise<void>;
  handleNotiClick: (noti: INotification) => Promise<void>;
  notiref: React.RefObject<HTMLDivElement | null>;
}

export interface UserMenuDropdownProps {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleMenuToggle: () => void;
  user: any;
  handleLogout: () => void;
  navigate: (path: string) => void;
  menuref: React.RefObject<HTMLDivElement | null>;
}
