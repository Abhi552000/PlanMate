import React from "react";
import { Search, X, List, LayoutGrid, BarChart2 } from "lucide-react";
import { FilterSelect } from "./FilterSelect";
import { IUser, DashboardFiltersProps } from "../../types";

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
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

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedAssignee("all");
    setSelectedPriority("all");
    setSelectedStatus("all");
    setSelectedTimeframe("all");
  };

  return (
    <div className="flex flex-col gap-3 bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-2xl border border-sky-100 dark:border-gray-800 shadow-sm">
      {/* Top Row: Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative min-w-[200px] sm:min-w-[280px] flex-1">
          <input
            type="text"
            placeholder="Search issues (title, desc, key)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-gray-50/50 dark:bg-gray-950 border border-sky-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-4 h-4 text-sky-500" />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-605 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Assignee Filter Dropdown */}
        <FilterSelect
          label="Assignee"
          value={selectedAssignee}
          onChange={setSelectedAssignee}
          options={[
            { label: "All", value: "all" },
            { label: "Unassigned", value: "unassigned" },
            ...members.map((member) => ({ label: member.name, value: member._id })),
          ]}
        />

        {/* Priority Filter Dropdown */}
        <FilterSelect
          label="Priority"
          value={selectedPriority}
          onChange={setSelectedPriority}
          options={[
            { label: "All", value: "all" },
            { label: "Low", value: "Low" },
            { label: "Medium", value: "Medium" },
            { label: "High", value: "High" },
          ]}
        />

        {/* Status Filter Dropdown */}
        <FilterSelect
          label="Status"
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={[
            { label: "All", value: "all" },
            ...statuses.map((status) => ({ label: status, value: status })),
          ]}
        />

        {/* Timeframe Filter Dropdown */}
        <FilterSelect
          label="Timeframe"
          value={selectedTimeframe}
          onChange={setSelectedTimeframe}
          options={[
            { label: "All Time", value: "all" },
            { label: "Due Today", value: "today" },
            { label: "Due This Week", value: "week" },
            { label: "Overdue", value: "overdue" },
          ]}
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
      <div className="flex justify-between items-center pt-2.5 border-t border-sky-100/50 dark:border-gray-800/50 text-xs">
        <span className="font-semibold text-gray-500 dark:text-gray-400">
          Showing {filterTasksCount} of {totalTasksCount} issues
        </span>

        <div className="flex bg-sky-50 dark:bg-gray-800 p-1 rounded-lg border border-sky-100/50 dark:border-gray-700">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
              viewMode === "kanban"
                ? "bg-white dark:bg-gray-700 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-100 dark:border-gray-600 font-bold"
                : "text-gray-600 dark:text-gray-400 hover:text-sky-700 dark:hover:text-sky-300"
            }`}
            title="Kanban Board"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Board
          </button>
        </div>
      </div>
    </div>
  );
};
