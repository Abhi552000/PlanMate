import React from "react";
import { CheckSquare, Bug, BookOpen, Award, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BacklogTaskRowProps } from "../../../../types";
import { EPIC_COLORS } from "../../../../constants/uiTexts";
import { getPriorityStyle } from "../../../../utils";

const getIssueTypeIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "bug":
      return <Bug className="w-4 h-4 text-rose-500 fill-rose-500/20 shrink-0" />;
    case "story":
      return <BookOpen className="w-4 h-4 text-emerald-500 fill-emerald-500/20 shrink-0" />;
    case "epic":
      return <Award className="w-4 h-4 text-purple-500 fill-purple-500/20 shrink-0" />;
    default:
      return <CheckSquare className="w-4 h-4 text-sky-500 fill-sky-500/20 shrink-0" />;
  }
};

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
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 bg-white dark:bg-slate-900/90 hover:bg-sky-50/30 dark:hover:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer gap-2.5 sm:gap-3 border-l-[3.5px] ${
        task.priority === "High"
          ? "border-l-rose-500"
          : task.priority === "Medium"
          ? "border-l-amber-500"
          : "border-l-emerald-500"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Drag Handle */}
        <div
          className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 cursor-grab active:cursor-grabbing shrink-0 flex flex-col gap-0.5 transition-colors"
          title="Drag to reorder or move"
        >
          <span className="w-1.5 h-0.5 bg-current rounded-full" />
          <span className="w-1.5 h-0.5 bg-current rounded-full" />
          <span className="w-1.5 h-0.5 bg-current rounded-full" />
        </div>

        {getIssueTypeIcon(task.issueType)}

        {/* Issue Key */}
        <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50/80 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200/70 dark:border-sky-800/60 select-all shrink-0">
          {task.key ||
            `PM-${task._id ? task._id.slice(-4).toUpperCase() : "TASK"}`}
        </span>

        {/* Issue Title */}
        <h3
          className={`text-xs sm:text-sm font-semibold truncate flex-1 min-w-0 ${
            isCompleted
              ? "text-slate-400 line-through dark:text-slate-500"
              : "text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors"
          }`}
        >
          {task.title}
        </h3>

        {/* Epic Badge */}
        {task.epic && typeof task.epic === "object" && (
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${
              EPIC_COLORS[(task.epic as any).color] || EPIC_COLORS.sky
            }`}
          >
            {(task.epic as any).name}
          </span>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {task.labels.map((lbl: string, idx: number) => (
              <span
                key={idx}
                className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60"
              >
                {lbl}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0 flex-wrap sm:flex-nowrap justify-between sm:justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t border-slate-100 sm:border-0 dark:border-slate-800/50">
        {/* Status Badge */}
        {task.status && (
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
              isCompleted
                ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40"
                : task.status === "In Progress"
                ? "text-sky-700 bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/40"
                : "text-slate-700 bg-slate-100/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60"
            }`}
          >
            {task.status}
          </span>
        )}

        {/* Story Points */}
        {task.storyPoints !== undefined && (
          <span
            className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold border border-slate-200/70 dark:border-slate-700 shrink-0"
            title={`${task.storyPoints} Story Points`}
          >
            {task.storyPoints}
          </span>
        )}

        {/* Assignee Avatar */}
        {task.assignee ? (
          <div
            className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-[10px] border border-sky-200 dark:border-sky-800 uppercase shrink-0"
            title={`Assigned to: ${
              typeof task.assignee === "object"
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
          <div
            className="w-6 h-6 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-[9px] text-slate-400 shrink-0"
            title="Unassigned"
          >
            <User className="w-3 h-3 text-slate-400" />
          </div>
        )}

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPriorityStyle(
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
          className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 cursor-pointer focus:outline-none bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-sky-300 dark:hover:border-sky-700 transition-colors shadow-2xs"
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
