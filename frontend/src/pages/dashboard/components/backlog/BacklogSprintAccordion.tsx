import React from "react";
import { ChevronRight, ChevronDown, Archive, Plus, X } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { BacklogTaskRow } from "./BacklogTaskRow";
import { BACKLOG_TEXTS } from "../../../../constants/uiTexts";
import { BacklogSprintAccordionProps } from "../../../../types";

export const BacklogSprintAccordion: React.FC<BacklogSprintAccordionProps> = ({
  sprint,
  expandedSprintId,
  setExpandedSprintId,
  filteredTasks,
  todo,
  progress,
  done,
  setShowStartSprint,
  setConfirmCompleteSprintId,
  setConfirmDeleteSprintId,
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
  const isCollapsed = expandedSprintId !== sprint._id;

  return (
    <div
      className={`bg-white dark:bg-gray-900 border rounded-2xl shadow-sm overflow-hidden p-3.5 sm:p-4 ${
        sprint.status === "active"
          ? "border-sky-300 ring-2 ring-sky-500/10 dark:border-sky-850"
          : "border-sky-100/70 dark:border-gray-850"
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const taskId = e.dataTransfer.getData("text/plain");
        if (taskId) handleMoveTask(taskId, sprint._id);
      }}
    >
      {/* Sprint Header Panel */}
      <div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
          isCollapsed
            ? ""
            : "pb-3 border-b border-sky-55 dark:border-gray-855 mb-3"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setExpandedSprintId(isCollapsed ? sprint._id : null)}
            className="p-1 hover:bg-sky-100/50 dark:hover:bg-gray-850 rounded text-gray-500 cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-gray-800 dark:text-gray-150 text-sm truncate">
                {sprint.name}
              </h3>
              {sprint.status === "active" ? (
                <span className="text-[9px] font-black uppercase tracking-wider bg-sky-600 text-white px-2 py-0.5 rounded shadow-sm">
                  {BACKLOG_TEXTS.STATUS_ACTIVE}
                </span>
              ) : sprint.status === "completed" ? (
                <span className="text-[9px] font-black uppercase tracking-wider bg-gray-200 text-gray-650 px-2 py-0.5 rounded dark:bg-gray-800 dark:text-gray-405">
                  {BACKLOG_TEXTS.STATUS_COMPLETED}
                </span>
              ) : (
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/50">
                  {BACKLOG_TEXTS.STATUS_PLANNED}
                </span>
              )}
            </div>
            {sprint.goal && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                {BACKLOG_TEXTS.LABEL_GOAL}: {sprint.goal}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-gray-250 text-gray-705 flex items-center justify-center text-[9px] font-black">
              {todo}
            </span>
            <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px] font-black">
              {progress}
            </span>
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black">
              {done}
            </span>
          </div>

          <span className="text-[10px] text-gray-400 font-bold border dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-0.5 rounded-lg">
            {filteredTasks.length} {BACKLOG_TEXTS.METRIC_ISSUES}
          </span>

          {sprint.status !== "active" ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowStartSprint(sprint._id)}
            >
              {BACKLOG_TEXTS.BTN_START_SPRINT}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setConfirmCompleteSprintId(sprint._id)}
            >
              {BACKLOG_TEXTS.BTN_COMPLETE_SPRINT}
            </Button>
          )}

          <button
            onClick={() => setConfirmDeleteSprintId(sprint._id)}
            className="p-1 hover:bg-amber-50 text-amber-600 dark:hover:bg-amber-955/20 rounded cursor-pointer"
            title={BACKLOG_TEXTS.TOOLTIP_CLOSE_SPRINT}
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <BacklogTaskRow
              key={task._id}
              task={task}
              currentSprintId={sprint._id}
              onEdit={(t) => {
                setSelectedTaskToEdit(t);
                setIsTaskModalOpen(true);
              }}
              onMove={handleMoveTask}
              sprints={sprints}
            />
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-6 text-gray-400 dark:text-gray-500">
              <p className="text-xs">{BACKLOG_TEXTS.EMPTY_SPRINT_TASKS}</p>
            </div>
          )}

          {activeInlineCreator === sprint._id ? (
            <div className="bg-white dark:bg-gray-950 p-3 rounded-xl border border-dashed border-sky-200 dark:border-gray-800 flex items-center gap-2">
              <select
                value={inlineIssueType}
                onChange={(e) => setInlineIssueType(e.target.value)}
                className="text-xs border border-sky-100 dark:border-gray-800 rounded bg-white dark:bg-gray-900 px-2 py-1 outline-none text-gray-755 dark:text-gray-300 font-bold shrink-0"
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
                  if (e.key === "Enter") handleCreateInlineIssue(sprint._id);
                }}
                placeholder={BACKLOG_TEXTS.PLACEHOLDER_SPRINT_GOAL}
                className="flex-1 bg-transparent text-xs font-semibold px-2 py-1 outline-none text-gray-850 dark:text-gray-200 placeholder-gray-400"
                autoFocus
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleCreateInlineIssue(sprint._id)}
                loading={creatingInlineIssue === sprint._id}
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
                setActiveInlineCreator(sprint._id);
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
