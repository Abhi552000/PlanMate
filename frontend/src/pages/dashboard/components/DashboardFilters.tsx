import React from "react";
import { List, LayoutGrid, BarChart2 } from "lucide-react";
import { FilterSelect, SearchInput } from "../../../components/ui";
import { DashboardFiltersProps } from "../../../types";

export const DashboardFilters: React.FC<DashboardFiltersProps> = React.memo(({
  searchQuery,
  setSearchQuery,
  selectedAssignee,
  setSelectedAssignee,
  selectedPriority,
  setSelectedPriority,
  selectedStatus,
  setSelectedStatus,
  selectedTimeframe,
  setSelectedTimeframe,
  members,
  statuses,
  filterTasksCount,
  totalTasksCount,
  viewMode,
  setViewMode,
}) => {
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedAssignee !== "all" ||
    selectedPriority !== "all" ||
    selectedStatus !== "all" ||
    selectedTimeframe !== "all";

  const handleClearFilters = React.useCallback(() => {
    setSearchQuery("");
    setSelectedAssignee("all");
    setSelectedPriority("all");
    setSelectedStatus("all");
    setSelectedTimeframe("all");
  }, [setSearchQuery, setSelectedAssignee, setSelectedPriority, setSelectedStatus, setSelectedTimeframe]);

  const assigneeOptions = React.useMemo(() => [
    { label: "All", value: "all" },
    { label: "Unassigned", value: "unassigned" },
    ...members.map((member) => ({
      label: member.name,
      value: member._id,
    })),
  ], [members]);

  const priorityOptions = React.useMemo(() => [
    { label: "All", value: "all" },
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
  ], []);

  const statusOptions = React.useMemo(() => [
    { label: "All", value: "all" },
    { label: "Pending (Unresolved)", value: "pending" },
    ...statuses.map((status) => ({ label: status, value: status })),
  ], [statuses]);

  const timeframeOptions = React.useMemo(() => [
    { label: "All Time", value: "all" },
    { label: "Due Today", value: "today" },
    { label: "Due This Week", value: "week" },
    { label: "Overdue", value: "overdue" },
  ], []);

  return (
    <div className="flex flex-col gap-3 bg-white dark:bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
      {/* Top Row: Search and Filters */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Search Input */}
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search issues (title, desc, key)..."
          className="w-full sm:w-auto sm:min-w-[280px] sm:flex-1"
        />

        {/* Assignee Filter Dropdown */}
        <FilterSelect
          label="Assignee"
          value={selectedAssignee}
          onChange={setSelectedAssignee}
          options={assigneeOptions}
        />

        {/* Priority Filter Dropdown */}
        <FilterSelect
          label="Priority"
          value={selectedPriority}
          onChange={setSelectedPriority}
          options={priorityOptions}
        />

        {/* Status Filter Dropdown */}
        <FilterSelect
          label="Status"
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={statusOptions}
        />

        {/* Timeframe Filter Dropdown */}
        <FilterSelect
          label="Timeframe"
          value={selectedTimeframe}
          onChange={setSelectedTimeframe}
          options={timeframeOptions}
        />

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 px-2 py-1 rounded-md transition-colors cursor-pointer hover:bg-sky-50 dark:hover:bg-gray-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Bottom Row: View Mode Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 pt-2.5 border-t border-sky-100/50 dark:border-gray-800/50 text-xs">
        <span className="font-semibold text-gray-500 dark:text-gray-400">
          Showing {filterTasksCount} of {totalTasksCount} issues
        </span>

        <div className="flex w-full sm:w-auto bg-sky-50 dark:bg-gray-800 p-1 rounded-lg border border-sky-100/50 dark:border-gray-700">
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              viewMode === "list"
                ? "bg-white dark:bg-gray-700 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-100 dark:border-gray-600 font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-sky-700 dark:hover:text-sky-300"
            }`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              viewMode === "kanban"
                ? "bg-white dark:bg-gray-700 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-100 dark:border-gray-600 font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-sky-700 dark:hover:text-sky-300"
            }`}
            title="Kanban Board"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Board
          </button>
          <button
            onClick={() => setViewMode("analytics")}
            className={`flex-1 sm:flex-initial justify-center px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              viewMode === "analytics"
                ? "bg-white dark:bg-gray-700 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-100 dark:border-gray-600 font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-sky-700 dark:hover:text-sky-300"
            }`}
            title="Interactive Analytics"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Analytics
          </button>
        </div>
      </div>
    </div>
  );
});
