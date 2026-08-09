import React from "react";
import { IUser } from "./user";

export interface IHistoryEntry {
  _id?: string;
  field: string;
  oldValue: string;
  newValue: string;
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  } | any;
  updatedAt: string | Date;
}

export interface ISubtask {
  _id?: string;
  title: string;
  completed: boolean;
  status?: string;
  description?: string;
  priority?: string;
  dueDate?: string | Date;
  storyPoints?: number;
  issueType?: string;
}

export interface ITaskComment {
  _id: string;
  text: string;
  user: IUser;
  createdAt: string | Date;
}

export interface ITaskLink {
  _id?: string;
  linkType: "blocks" | "blocked by" | "relates to";
  targetTask: ITask | string | any;
}

export interface IWorkLog {
  _id?: string;
  hoursSpent: number;
  description?: string;
  user: IUser | string;
  createdAt: string | Date;
}

export interface ITask {
  _id: string;
  id?: string;
  key?: string;
  title: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  status: "To Do" | "In Progress" | "Done" | string;
  dueDate?: string | Date;
  completed: boolean | number | string;
  owner: IUser | string;
  assignee?: IUser | string | any;
  subtasks: ISubtask[];
  history: IHistoryEntry[];
  organization?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  storyPoints?: number;
  originalEstimate?: number;
  timeLogged?: number;
  workLogs?: IWorkLog[];
  issueType?: string;
  comments?: ITaskComment[];
  links?: ITaskLink[];
  sprint?: any;
  epic?: any;
}

export interface INotification {
  _id: string;
  user: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string | Date;
}

export interface TaskState {
  tasks: ITask[];
  statuses: string[];
  loading: boolean;
  error: string | null;
}

export interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: ITask | null;
  onSave?: (savedTask: ITask) => void;
  onLogout?: () => void;
  statuses?: string[];
}

export interface TaskFormGeneralProps {
  title: string;
  description: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  baseControlClasses: string;
}

export interface TaskFormMetaProps {
  taskData: any;
  setTaskData: React.Dispatch<React.SetStateAction<any>>;
  statuses: string[];
  members: any[];
  sprints?: any[];
  epics?: any[];
  parentTask: any;
  today: string;
  baseControlClasses: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export interface TaskFormSubtasksProps {
  subtasks: any[];
  setTaskData: React.Dispatch<React.SetStateAction<any>>;
  newSubtaskTitle: string;
  setNewSubtaskTitle: (val: string) => void;
  editingSubtaskIdx: number | null;
  setEditingSubtaskIdx: (val: number | null) => void;
  editingSubtaskVal: string;
  setEditingSubtaskVal: (val: string) => void;
  statuses: string[];
  onOpenSubtaskDetail: (subtask: any, index: number) => void;
  onAddSubtask: () => void;
}

export interface TaskDetailsHeaderProps {
  isEditingSubtask: boolean;
  projectKey: string;
  subtaskIndex: number | null;
  onBackToParent: () => void;
  onBackToBoard: () => void;
  onSave: () => void;
  saving: boolean;
}

export interface SubtaskListSectionProps {
  subtasks: any[];
  projectKey: string;
  newSubtaskTitle: string;
  setNewSubtaskTitle: (val: string) => void;
  editingSubtaskIdx: number | null;
  setEditingSubtaskIdx: (val: number | null) => void;
  editingSubtaskVal: string;
  setEditingSubtaskVal: (val: string) => void;
  statuses: string[];
  setParentTaskData: React.Dispatch<React.SetStateAction<any>>;
  onOpenSubtask: (index: number) => void;
  handleAddSubtask: () => void;
}

export interface ActivityTimelineSectionProps {
  history: any[];
}

export interface TaskDescriptionSectionProps {
  title: string;
  description: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  baseControlClasses: string;
}

export interface TaskMetaSidebarProps {
  taskData: any;
  setTaskData: React.Dispatch<React.SetStateAction<any>>;
  statuses: string[];
  members: any[];
  isEditingSubtask: boolean;
  today: string;
  baseControlClasses: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  linkType: "blocks" | "blocked by" | "relates to";
  setLinkType: (val: "blocks" | "blocked by" | "relates to") => void;
  targetTaskId: string;
  setTargetTaskId: (val: string) => void;
  workspaceTasks: any[];
  linking: boolean;
  links: any[];
  onAddLink: (e: React.FormEvent) => void;
  onRemoveLink: (linkId: string) => void;
  createdAt?: string | Date;
}

export interface CommentsSectionProps {
  comments: any[];
  commentText: string;
  setCommentText: (val: string) => void;
  addingComment: boolean;
  deletingCommentId: string | null;
  currentUser: any;
  onAddComment: (e: React.FormEvent) => void;
  onDeleteComment: (commentId: string) => void;
}
