import React from "react";
import { CheckSquare, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BacklogTaskRowProps } from "../../../../types";
import { EPIC_COLORS } from "../../../../constants/uiTexts";
import { getPriorityStyle } from "../../../../utils";

export const BacklogTaskRow: React.FC<BacklogTaskRowProps> = React.memo(({
  task,
  currentSprintId,
  onEdit,
  onMove,
  sprints,
}) => {
  const navigate = useNavigate();
  const isCompleted =
    task.status === "Done" ||
    task.completed === "Yes" ||
    task.completed === true;

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", task._id)}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest("select")) return;
        navigate(`/task/${task._id}`);
      }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-2.5 bg-white dark:bg-gray-900 hover:bg-sky-5/30 dark:hover:bg-gray-800/35 rounded-xl border border-sky-100/70 dark:border-gray-800 shadow-xs transition-all duration-200 cursor-pointer gap-3 border-l-4 ${task.priority === "High"
        ? "border-l-red-500"
        : task.priority === "Medium"
          ? "border-l-sky-500"
          : "border-l-green-500"
        }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Drag Handle */}
        <div className="text-gray-305 dark:text-gray-650 cursor-grab active:cursor-grabbing shrink-0 flex flex-col gap-0.5">
          <span className="w-1.5 h-0.5 bg-current rounded-full" />
          <span className="w-1.5 h-0.5 bg-current rounded-full" />
          <span className="w-1.5 h-0.5 bg-current rounded-full" />
        </div>

        <CheckSquare className="w-4 h-4 text-sky-500 fill-sky-50 dark:fill-sky-950/20 shrink-0" />

        {/* Issue Key */}
        <span className="text-xs font-bold text-gray-400 select-all shrink-0">
          {task.key ||
            `PM-${task._id ? task._id.slice(-4).toUpperCase() : "TASK"}`}
        </span>

        {/* Issue Title */}
        <h3
          className={`text-sm font-semibold truncate ${isCompleted
            ? "text-gray-400 line-through"
            : "text-gray-750 dark:text-gray-200"
            }`}
        >
          {task.title}
        </h3>

        {/* Epic Badge */}
        {task.epic && typeof task.epic === "object" && (
          <span
            className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${EPIC_COLORS[(task.epic as any).color] || EPIC_COLORS.sky
              }`}
          >
            {(task.epic as any).name}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3.5 text-xs shrink-0 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
        {/* Status Badge */}
        {task.status && (
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isCompleted
              ? "text-green-700 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/40"
              : task.status === "In Progress"
                ? "text-sky-700 bg-sky-50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800/40"
                : "text-slate-700 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              }`}
          >
            {task.status}
          </span>
        )}

        {/* Story Points Circle */}
        {task.storyPoints !== undefined && (
          <span className="w-5 h-5 rounded-full bg-gray-150 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center text-[9px] font-black shrink-0">
            {task.storyPoints}
          </span>
        )}

        {/* Assignee Avatar */}
        {task.assignee ? (
          <div
            className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 flex items-center justify-center font-extrabold text-[9px] border border-sky-200 dark:border-gray-800 uppercase shrink-0"
            title={`Assigned to: ${typeof task.assignee === "object"
              ? (task.assignee as any).name
              : "Team Member"
              }`}
          >
            {typeof task.assignee === "object" && (task.assignee as any).name
              ? (task.assignee as any).name
                .split(/\s+/)
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
              : "U"}
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-[8px] text-gray-400 shrink-0">
            <User className="w-2.5 h-2.5" />
          </div>
        )}

        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityStyle(
            task.priority
          )}`}
        >
          {task.priority || "Low"}
        </span>

        {/* Action Destination Selector */}
        <select
          onChange={(e) => {
            const val = e.target.value;
            onMove(task._id, val === "backlog" ? null : val);
          }}
          value={currentSprintId || "backlog"}
          className="px-2 py-1 rounded text-xs font-bold border border-sky-100 dark:border-gray-800 cursor-pointer focus:outline-none bg-white dark:bg-gray-900 text-gray-500"
        >
          <option value={currentSprintId || "backlog"}>Move</option>
          {currentSprintId !== "backlog" && (
            <option value="backlog">Backlog</option>
          )}
          {sprints
            .filter((s) => s._id !== currentSprintId)
            .map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
});
