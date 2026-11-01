import React from "react";
import { Filter, LayoutGrid } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
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
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
      {/* Quick Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1 shrink-0">
          <Filter className="w-3.5 h-3.5" /> {ACTIVE_SPRINT_TEXTS.FILTER_LABEL}
        </span>
        <Button
          variant={onlyMyIssues ? "primary" : "outline"}
          size="sm"
          onClick={() => setOnlyMyIssues(!onlyMyIssues)}
          className="shrink-0"
        >
          {ACTIVE_SPRINT_TEXTS.BTN_ONLY_MY_ISSUES}
        </Button>
        <Button
          variant={highPriorityOnly ? "primary" : "outline"}
          size="sm"
          onClick={() => setHighPriorityOnly(!highPriorityOnly)}
          className="shrink-0"
        >
          {ACTIVE_SPRINT_TEXTS.BTN_HIGH_PRIORITY}
        </Button>
      </div>

      {/* Grouping Dropdown */}
      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <LayoutGrid className="w-3.5 h-3.5" />{" "}
          {ACTIVE_SPRINT_TEXTS.GROUP_BY_LABEL}
        </span>
        <Button
          variant={groupByEpic ? "primary" : "outline"}
          size="sm"
          onClick={() => setGroupByEpic(!groupByEpic)}
        >
          {ACTIVE_SPRINT_TEXTS.BTN_EPIC_SWIMLANES}
        </Button>
      </div>
    </div>
  );
};
