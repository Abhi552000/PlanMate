import React from "react";
import { Edit, ArrowLeft, ArrowRight, Bug, BookOpen, Award, CheckSquare } from "lucide-react";
import { ITask, KanbanCardProps } from "../../types";
import { getPriorityStyle } from "../../utils";
import { MentionText } from "../MentionText";

const getIssueTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "bug":
      return <Bug className="w-4 h-4 text-red-500 fill-red-50" />;
    case "story":
      return <BookOpen className="w-4 h-4 text-green-500 fill-green-50" />;
    case "epic":
      return <Award className="w-4 h-4 text-purple-600 fill-purple-50" />;
    default:
      return <CheckSquare className="w-4 h-4 text-sky-500 fill-sky-50" />;
  }
};

const getIssueTypeLeftBorder = (type: string) => {
  switch (type?.toLowerCase()) {
    case "bug":
      return "border-l-4 border-l-red-500 border-y-sky-100 dark:border-y-gray-800 border-r-sky-100 dark:border-r-gray-800";
    case "story":
      return "border-l-4 border-l-green-500 border-y-sky-100 dark:border-y-gray-800 border-r-sky-100 dark:border-r-gray-800";
    case "epic":
      return "border-l-4 border-l-purple-600 border-y-sky-100 dark:border-y-gray-800 border-r-sky-100 dark:border-r-gray-800";
    default:
      return "border-l-4 border-l-sky-500 border-y-sky-100 dark:border-y-gray-800 border-r-sky-100 dark:border-r-gray-800";
  }
};

export const KanbanCard: React.FC<KanbanCardProps> = React.memo(({
  task,
  col,
  columns,
  navigate,
  handleDragStart,
  handleStatusTransition,
}) => {
  const type = "Task";

  return (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, task._id)}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("select")) return;
        navigate(`/task/${task._id}`);
      }}
      className={`[content-visibility:auto] [contain-intrinsic-size:0_130px] bg-white dark:bg-gray-950 border rounded-lg p-3.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 group cursor-grab active:cursor-grabbing ${getIssueTypeLeftBorder(
        type
      )}`}
    >
      <div>
        {/* Top Row: Type & Actions */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            {getIssueTypeIcon(type)}
            <span className="text-[10px] font-black tracking-wider uppercase text-sky-700 bg-sky-100/50 px-1.5 py-0.5 rounded border border-sky-200 dark:border-gray-800">
              {task.key || `PM-${task._id ? task._id.slice(-4).toUpperCase() : "TASK"}`}
            </span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => navigate(`/task/${task._id}`)}
              className="p-1 text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-gray-800 rounded transition-colors cursor-pointer"
              title="Open Issue"
              aria-label={`Open issue ${task.title}`}
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            <MentionText text={task.description} />
          </p>
        )}
      </div>

      {/* Bottom Row: Attributes & Transitions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800 mt-1">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
            {task.priority || "Low"}
          </span>

          {/* Assignee Avatar */}
          {task.assignee && (
            <div
              className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 flex items-center justify-center font-extrabold text-[8px] border border-sky-200 dark:border-gray-800 uppercase shrink-0"
              title={`Assigned to: ${typeof task.assignee === "object" ? task.assignee.name : "Team Member"}`}
            >
              {typeof task.assignee === "object" && task.assignee.name
                ? task.assignee.name
                    .split(/\s+/)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "U"}
            </div>
          )}
        </div>

        {/* Column transition controls */}
        <div className="flex items-center gap-1">
          {columns.indexOf(col) > 0 && (
            <button
              onClick={() => {
                const prevIdx = columns.indexOf(col) - 1;
                handleStatusTransition(task._id, columns[prevIdx]);
              }}
              className="p-1 bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-600 rounded transition-colors cursor-pointer"
              title="Move Left"
              aria-label="Move issue left"
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
          )}
          {columns.indexOf(col) < columns.length - 1 && (
            <button
              onClick={() => {
                const nextIdx = columns.indexOf(col) + 1;
                handleStatusTransition(task._id, columns[nextIdx]);
              }}
              className="p-1 bg-sky-50 dark:bg-sky-950 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-600 rounded transition-colors cursor-pointer"
              title="Move Right"
              aria-label="Move issue right"
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
