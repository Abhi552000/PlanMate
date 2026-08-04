import { IUser } from "./user";

export interface IOrganization {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  taskCounter?: number;
  createdAt?: string;
  statuses?: string[];
}

export interface ExtendedUser extends IUser {
  solvedTasks?: number;
  createdAt?: string;
  solvedTasksCount?: number;
}
