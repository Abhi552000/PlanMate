import { IBoardFeatures, ICustomField } from "./organization";

export type BoardEnvironment =
  | "development"
  | "sit"
  | "uat"
  | "staging"
  | "production"
  | "other";

export interface IBoard {
  _id: string;
  name: string;
  key: string;
  environment: BoardEnvironment;
  description?: string;
  organization: string;
  taskCounter: number;
  totalTasks?: number;
  statuses: string[];
  priorities: string[];
  boardFeatures: IBoardFeatures;
  customFields: ICustomField[];
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}
