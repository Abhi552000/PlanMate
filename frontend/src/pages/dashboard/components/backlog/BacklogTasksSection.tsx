import React from "react";
import { ChevronRight, ChevronDown, Plus, X } from "lucide-react";
import { BacklogTaskRow } from "./BacklogTaskRow";
import { Button } from "../../../../components/ui/Button";
import { BACKLOG_TEXTS } from "../../../../constants/uiTexts";
import { BacklogTasksSectionProps } from "../../../../types";

export const BacklogTasksSection: React.FC<BacklogTasksSectionProps> = ({
  expandedSprintId,
  setExpandedSprintId,
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
  const isBacklogExpanded = expandedSprintId === "backlog";

  return (
    <div
      className="bg-white dark:bg-gray-900 border border-sky-100/70 dark:border-gray-855 rounded-2xl shadow-sm overflow-hidden p-3.5 sm:p-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const taskId = e.dataTransfer.getData("text/plain");
        if (taskId) handleMoveTask(taskId, null);
      }}
    >
      <div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
          !isBacklogExpanded ? "" : "pb-3 border-b border-sky-50 dark:border-gray-855 mb-3"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setExpandedSprintId(isBacklogExpanded ? null : "backlog")}
            className="p-1 hover:bg-sky-100/50 dark:hover:bg-gray-855 rounded text-gray-550 cursor-pointer"
          >
            {!isBacklogExpanded ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <div className="min-w-0">
            <h3 className="font-extrabold text-gray-805 dark:text-gray-150 text-sm">
              {BACKLOG_TEXTS.HEADER_BACKLOG_ISSUES}
            </h3>
          </div>
        </div>
        <span className="text-[10px] text-gray-404 font-bold border dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-0.5 rounded-lg">
          {filterByEpic(backlogTasks).length} {BACKLOG_TEXTS.METRIC_ISSUES} •{" "}
          <strong className="text-sky-600">
            {filterByEpic(backlogTasks).reduce((sum, t) => sum + (t.storyPoints || 0), 0)} SP
          </strong>
        </span>
      </div>

      {isBacklogExpanded && (
        <div className="space-y-2.5">
          {filterByEpic(backlogTasks).map((task) => (
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

          {backlogTasks.length === 0 && (
            <div className="text-center py-6 text-gray-404 dark:text-gray-500">
              <p className="text-xs">{BACKLOG_TEXTS.EMPTY_BACKLOG_TASKS}</p>
            </div>
          )}

          {activeInlineCreator === "backlog" ? (
            <div className="bg-white dark:bg-gray-955 p-3 rounded-xl border border-dashed border-sky-200 dark:border-gray-800 flex items-center gap-2">
              <select
                value={inlineIssueType}
                onChange={(e) => setInlineIssueType(e.target.value)}
                className="text-xs border border-sky-100 dark:border-gray-800 rounded bg-white dark:bg-gray-905 px-2 py-1 outline-none text-gray-755 dark:text-gray-300 font-bold shrink-0"
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
                className="flex-1 bg-transparent text-xs font-semibold px-2 py-1 outline-none text-gray-850 dark:text-gray-202 placeholder-gray-400"
                autoFocus
              />
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
                className="p-1 hover:bg-gray-105 dark:hover:bg-gray-800 rounded text-gray-404"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setActiveInlineCreator("backlog");
                setInlineIssueType("Story");
              }}
              className="w-full text-left px-4 py-3 hover:bg-sky-50/20 text-gray-404 dark:text-gray-500 hover:text-sky-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-dashed border-sky-100/70 dark:border-gray-800 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" /> {BACKLOG_TEXTS.BTN_CREATE_ISSUE}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
