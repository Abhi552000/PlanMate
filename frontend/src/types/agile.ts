import { ITask } from "./task";

export interface ISprint {
  _id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status: "planned" | "active" | "completed" | "closed";
  goal?: string;
  organization: string;
  tasks?: ITask[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IEpic {
  _id: string;
  name: string;
  color?: string;
  description?: string;
  organization: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SprintState {
  sprints: ISprint[];
  backlogTasks: ITask[];
  activeSprint: ISprint | null;
  loading: boolean;
  error: string | null;
}

export interface EpicState {
  epics: IEpic[];
  loading: boolean;
  error: string | null;
}
