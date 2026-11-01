import React from "react";
import { FilterSelect } from "../../../../components/ui/FilterSelect";
import { ACTIVE_SPRINT_TEXTS } from "../../../../constants/uiTexts";
import { ActiveSprintFiltersProps } from "../../../../types";

export const ActiveSprintFilters: React.FC<ActiveSprintFiltersProps> = ({
  onlyMyIssues,
  setOnlyMyIssues,
  highPriorityOnly,
  setHighPriorityOnly,
  groupByEpic,
  setGroupByEpic,
}) => {
  const hasActiveFilters = onlyMyIssues || highPriorityOnly || groupByEpic;

  const handleClearFilters = () => {
    setOnlyMyIssues(false);
    setHighPriorityOnly(false);
    setGroupByEpic(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs mb-6">
      {/* Filter Dropdowns Matching Dashboard */}
      <div className="flex flex-wrap items-center gap-2.5">
        <FilterSelect
          label="Filter"
          value={onlyMyIssues ? "my_issues" : "all"}
          options={[
            { label: "All Board Issues", value: "all" },
            { label: ACTIVE_SPRINT_TEXTS.BTN_ONLY_MY_ISSUES, value: "my_issues" },
          ]}
          onChange={(val) => setOnlyMyIssues(val === "my_issues")}
        />

        <FilterSelect
          label="Priority"
          value={highPriorityOnly ? "high" : "all"}
          options={[
            { label: "All Priorities", value: "all" },
            { label: ACTIVE_SPRINT_TEXTS.BTN_HIGH_PRIORITY, value: "high" },
          ]}
          onChange={(val) => setHighPriorityOnly(val === "high")}
        />

        <FilterSelect
          label="Swimlanes"
          value={groupByEpic ? "epic" : "none"}
          options={[
            { label: "Default Columns", value: "none" },
            { label: ACTIVE_SPRINT_TEXTS.BTN_EPIC_SWIMLANES, value: "epic" },
          ]}
          onChange={(val) => setGroupByEpic(val === "epic")}
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer hover:bg-sky-50 dark:hover:bg-slate-800 border border-transparent hover:border-sky-100 dark:hover:border-slate-700"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
