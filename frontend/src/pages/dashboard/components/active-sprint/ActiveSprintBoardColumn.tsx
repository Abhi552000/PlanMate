import React from "react";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActiveSprintBoardColumnProps } from "../../../../types";
import { EPIC_COLORS } from "../../../../constants/uiTexts";

export const ActiveSprintBoardColumn: React.FC<
  ActiveSprintBoardColumnProps
> = React.memo(({
  statuses,
  sprintTasks,
  handleUpdateStatus,
  setSelectedTaskToEdit,
  setIsTaskModalOpen,
}) => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        gridTemplateColumns: `repeat(${statuses.length}, minmax(0, 1fr))`,
      }}
      className="flex flex-row overflow-x-auto gap-4 lg:gap-5 pb-4 md:grid md:items-start select-none max-w-full snap-x snap-mandatory scroll-smooth -mx-3.5 px-3.5 sm:mx-0 sm:px-0"
    >
      {statuses.map((colName) => {
        const colTasks = sprintTasks.filter((t) => t.status === colName);
        return (
          <div
            key={colName}
            className="bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3 sm:p-3.5 flex flex-col min-h-[220px] max-h-[600px] overflow-y-auto w-[270px] sm:w-[300px] md:w-auto shrink-0 md:shrink snap-center transition-all shadow-2xs"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const taskId = e.dataTransfer.getData("text/plain");
              if (taskId) handleUpdateStatus(taskId, colName);
            }}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 shrink-0 border-b border-slate-200/70 dark:border-slate-800/70 pb-2">
              <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                {colName}
              </span>
              <span className="text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
                {colTasks.length}
              </span>
            </div>

            {/* Column Tasks */}
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {colTasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", task._id)
                  }
                  onClick={() => {
                    navigate(`/task/${task._id}`);
                  }}
                  className="bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3 shadow-2xs hover:border-sky-300 dark:hover:border-sky-500/60 hover:shadow-xs transition-all cursor-pointer group space-y-2 relative"
                >
                  <div className="space-y-1">
                    {task.key && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded border border-sky-200/60 dark:border-sky-800/60 select-all inline-block">
                        {task.key}
                      </span>
                    )}
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400 line-clamp-2 transition-colors">
                      {task.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    {/* Epic Badge */}
                    {task.epic && typeof task.epic === "object" ? (
                      <span
                        className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0 ${
                          EPIC_COLORS[(task.epic as any).color] ||
                          EPIC_COLORS.sky
                        }`}
                      >
                        {(task.epic as any).name}
                      </span>
                    ) : (
                      <div />
                    )}

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Story Points */}
                      {task.storyPoints !== undefined && (
                        <span
                          className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold border border-slate-200/80 dark:border-slate-600"
                          title={`${task.storyPoints} Story Points`}
                        >
                          {task.storyPoints}
                        </span>
                      )}

                      {/* Assignee Avatar */}
                      {task.assignee ? (
                        <div
                          className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center text-[9px] font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 uppercase"
                          title={
                            typeof task.assignee === "object"
                              ? (task.assignee as any).name
                              : "Assigned"
                          }
                        >
                          {typeof task.assignee === "object"
                            ? (task.assignee as any).name?.[0]?.toUpperCase()
                            : "A"}
                        </div>
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-[8px] text-slate-400"
                          title="Unassigned"
                        >
                          <User className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});
