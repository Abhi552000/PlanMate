import { ITask, IUser } from "./index";

export interface DashboardContext {
  tasks: ITask[];
  refreshTasks: (silent?: boolean) => void;
  viewMode: string;
  setViewMode: (val: string) => void;
  loading?: boolean;
}

export interface KanbanBoardProps {
  tasks: ITask[];
  onRefresh?: () => void;
  onEdit?: (task: ITask) => void;
  onLogout?: () => void;
  columns?: string[];
  loading?: boolean;
}

export interface AnalyticsDashboardProps {
  tasks: ITask[];
  onApplyFilters?: (filters: any) => void;
}

export interface TaskItemProps {
  task: ITask;
  onRefresh?: () => void;
  onLogout?: () => void;
  showCompleteCheckbox?: boolean;
  statuses?: string[];
}

export interface DashboardHeaderProps {
  totalTasks: number;
  lowPriority: number;
  mediumPriority: number;
  highPriority: number;
  onAddTask: () => void;
}

export interface DashboardFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedAssignee: string;
  setSelectedAssignee: (val: string) => void;
  selectedPriority: string;
  setSelectedPriority: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedTimeframe: string;
  setSelectedTimeframe: (val: string) => void;
  members: IUser[];
  statuses: string[];
  filterTasksCount: number;
  totalTasksCount: number;
  viewMode: string;
  setViewMode: (val: string) => void;
}

export interface ListModeViewProps {
  paginatedTasks: ITask[];
  currentPage: number;
  totalPages: number;
  totalTasksCount: number;
  loadingList: boolean;
  selectedStatus: string;
  statuses?: string[];
  onAddTask: () => void;
  onRefresh: () => void;
  onLoadMore: (page: number) => void;
}

export interface FilterSelectProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}
