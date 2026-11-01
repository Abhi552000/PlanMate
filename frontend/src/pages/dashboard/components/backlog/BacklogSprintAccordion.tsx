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
  isCollapsed: propsIsCollapsed,
  onToggleCollapse,
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
  const isCollapsed =
    onToggleCollapse !== undefined
      ? Boolean(propsIsCollapsed)
      : expandedSprintId !== sprint._id;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else if (setExpandedSprintId) {
      setExpandedSprintId(isCollapsed ? sprint._id : null);
    }
  };

  const isActive = sprint.status === "active";

  return (
    <div
      className={`bg-white dark:bg-slate-900/90 rounded-2xl shadow-xs transition-all overflow-hidden p-3.5 sm:p-5 border ${
        isActive
          ? "border-sky-300 dark:border-sky-500/50 ring-2 ring-sky-500/10 shadow-sm"
          : "border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80"
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        const taskId = e.dataTransfer.getData("text/plain");
        if (taskId) handleMoveTask(taskId, sprint._id);
      }}
    >
      {/* Sprint Header Panel */}
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
            title={isCollapsed ? "Expand sprint" : "Collapse sprint"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                onClick={handleToggle}
                className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
              >
                {sprint.name}
              </h3>
              {isActive ? (
                <span className="text-[10px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-400/40 dark:border-sky-500/30 px-2 py-0.5 rounded-md shadow-2xs">
                  {BACKLOG_TEXTS.STATUS_ACTIVE}
                </span>
              ) : sprint.status === "completed" ? (
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {BACKLOG_TEXTS.STATUS_COMPLETED}
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100/80 text-slate-600 border border-slate-200/90 px-2 py-0.5 rounded-md dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80">
                  {BACKLOG_TEXTS.STATUS_PLANNED}
                </span>
              )}
            </div>
            {sprint.goal && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                {BACKLOG_TEXTS.LABEL_GOAL}: {sprint.goal}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls & Metrics (Fully Mobile Responsive) */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2 sm:gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-0 dark:border-slate-800/50">
          <div className="flex items-center gap-1.5">
            <span
              className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold border border-slate-200/70 dark:border-slate-700"
              title="To Do Story Points"
            >
              {todo}
            </span>
            <span
              className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs"
              title="In Progress Story Points"
            >
              {progress}
            </span>
            <span
              className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs"
              title="Done Story Points"
            >
              {done}
            </span>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 px-2.5 py-0.5 rounded-lg shadow-2xs">
            {filteredTasks.length} {BACKLOG_TEXTS.METRIC_ISSUES}
          </span>

          <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
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
              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300 rounded-lg cursor-pointer transition-colors"
              title={BACKLOG_TEXTS.TOOLTIP_CLOSE_SPRINT}
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
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
            <div className="text-center py-7 text-slate-400 dark:text-slate-500 bg-slate-50/40 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200/70 dark:border-slate-800/60">
              <p className="text-xs font-medium">{BACKLOG_TEXTS.EMPTY_SPRINT_TASKS}</p>
            </div>
          )}

          {activeInlineCreator === sprint._id ? (
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
                    if (e.key === "Enter") handleCreateInlineIssue(sprint._id);
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
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setActiveInlineCreator(sprint._id);
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
