import React from "react";
import { ChevronRight, ChevronDown, Plus, X } from "lucide-react";
import { BacklogTaskRow } from "./BacklogTaskRow";
import { Button } from "../../../../components/ui/Button";
import { BACKLOG_TEXTS } from "../../../../constants/uiTexts";
import { BacklogTasksSectionProps } from "../../../../types";

export const BacklogTasksSection: React.FC<BacklogTasksSectionProps> = ({
  expandedSprintId,
  setExpandedSprintId,
  isCollapsed: propsIsCollapsed,
  onToggleCollapse,
  backlogTasks,
  filterByEpic,
  handleMoveTask,
  setSelectedTaskToEdit,
  setIsTaskModalOpen,
  activeInlineCreator,
  setActiveInlineCreator,
  inlineIssueType,
  setInlineIssueType,
  inlineTitle,
  setInlineTitle,
  handleCreateInlineIssue,
  creatingInlineIssue,
  sprints,
}) => {
  const isCollapsed =
    onToggleCollapse !== undefined
      ? Boolean(propsIsCollapsed)
      : expandedSprintId !== "backlog";

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else if (setExpandedSprintId) {
      setExpandedSprintId(isCollapsed ? "backlog" : null);
    }
  };

  const visibleTasks = filterByEpic(backlogTasks);
  const totalSP = visibleTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  return (
    <div
      className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs transition-all overflow-hidden p-3.5 sm:p-5 hover:border-slate-300 dark:hover:border-slate-700/80"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const taskId = e.dataTransfer.getData("text/plain");
        if (taskId) handleMoveTask(taskId, null);
      }}
    >
      <div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${
          isCollapsed
            ? ""
            : "pb-3.5 border-b border-slate-100 dark:border-slate-800/70 mb-3.5"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
          <button
            onClick={handleToggle}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? "Expand backlog" : "Collapse backlog"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <h3
              onClick={handleToggle}
              className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
            >
              {BACKLOG_TEXTS.HEADER_BACKLOG_ISSUES}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-1 sm:pt-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 px-2.5 py-0.5 rounded-lg shadow-2xs">
            {visibleTasks.length} {BACKLOG_TEXTS.METRIC_ISSUES} •{" "}
            <strong className="text-sky-600 dark:text-sky-400 font-bold">
              {totalSP} SP
            </strong>
          </span>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-2.5">
          {visibleTasks.map((task) => (
            <BacklogTaskRow
              key={task._id}
              task={task}
              currentSprintId={null}
              onEdit={(t) => {
                setSelectedTaskToEdit(t);
                setIsTaskModalOpen(true);
              }}
              onMove={handleMoveTask}
              sprints={sprints}
            />
          ))}

          {visibleTasks.length === 0 && (
            <div className="text-center py-7 text-slate-400 dark:text-slate-500 bg-slate-50/40 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200/70 dark:border-slate-800/60">
              <p className="text-xs font-medium">{BACKLOG_TEXTS.EMPTY_BACKLOG_TASKS}</p>
            </div>
          )}

          {activeInlineCreator === "backlog" ? (
            <div className="bg-slate-50/80 dark:bg-slate-950/60 p-3 sm:p-3.5 rounded-xl border border-dashed border-sky-300 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <select
                  value={inlineIssueType}
                  onChange={(e) => setInlineIssueType(e.target.value)}
                  className="text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 px-2.5 py-1.5 outline-none text-slate-800 dark:text-slate-200 font-bold shrink-0 cursor-pointer focus:ring-1 focus:ring-sky-500"
                >
                  <option value="Story">Story</option>
                  <option value="Task">Task</option>
                  <option value="Bug">Bug</option>
                </select>
                <input
                  type="text"
                  value={inlineTitle}
                  onChange={(e) => setInlineTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateInlineIssue(null);
                  }}
                  placeholder={BACKLOG_TEXTS.PLACEHOLDER_SPRINT_GOAL}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium px-3 py-1.5 outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCreateInlineIssue(null)}
                  loading={creatingInlineIssue === "backlog"}
                >
                  {BACKLOG_TEXTS.INLINE_CREATOR_SAVE}
                </Button>
                <button
                  onClick={() => {
                    setActiveInlineCreator(null);
                    setInlineTitle("");
                  }}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setActiveInlineCreator("backlog");
                setInlineIssueType("Story");
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-sky-50/40 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl"
            >
              <Plus className="w-4 h-4 text-sky-500" /> {BACKLOG_TEXTS.BTN_CREATE_ISSUE}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
