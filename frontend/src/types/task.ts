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
  issueType?: string;
  comments?: ITaskComment[];
  links?: ITaskLink[];
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
