import { ITask } from "./task";

export interface IDonutItem {
  name: string;
  value: number;
  color: string;
}

export interface ILeadTimePoint {
  date: string;
  bug: number;
  task: number;
  story: number;
  epic?: number;
}

export interface ICompletionTrendPoint {
  period: string;
  task: number;
  bug: number;
  story: number;
  epic: number;
  total: number;
}

export interface ICycleTimePoint {
  date: string;
  cycleTime: number; // in days
  key?: string;
  title?: string;
}

export interface ICreationTrendPoint {
  period: string;
  todo: number;
  inProgress: number;
  done: number;
  reopen: number;
  total: number;
}

export interface IReportKPIs {
  completedCount: number;
  inProgressCount: number;
  openCount: number;
  createdCount: number;
  dueCount: number;
  totalCount: number;
  completionRate: string;
  timeframe: "all" | "30d" | "7d";
  periodLabel: string;
}

export interface ReportDonutBreakdownsProps {
  statusData: IDonutItem[];
  typeData: IDonutItem[];
  assigneeData: IDonutItem[];
  totalTasks: number;
  onSliceClick?: (category: "status" | "type" | "assignee", value: string) => void;
}

export interface ReportTrendsSectionProps {
  leadTimeData: ILeadTimePoint[];
  completionTrendData: ICompletionTrendPoint[];
  cycleTimeData: ICycleTimePoint[];
  creationTrendData: ICreationTrendPoint[];
}

export interface ReportSummaryKPIsProps {
  kpis: IReportKPIs;
  onFilterClick?: (filterType: string) => void;
}

export interface ReportWorkItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  tasks: ITask[];
}

export interface ReportWorkItemTableProps {
  tasks: ITask[];
  loading?: boolean;
  onSelectTask?: (task: ITask) => void;
}
