import React from "react";
import { User } from "lucide-react";
import { ActiveSprintBoardColumnProps } from "../../../../types";
import { EPIC_COLORS } from "../../../../constants/uiTexts";

export const ActiveSprintBoardColumn: React.FC<
  ActiveSprintBoardColumnProps
> = ({
  statuses,
  sprintTasks,
  handleUpdateStatus,
  setSelectedTaskToEdit,
  setIsTaskModalOpen,
}) => {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4"
      style={{
        gridTemplateColumns: `repeat(${statuses.length}, minmax(0, 1fr))`,
      }}
    >
      {statuses.map((colName) => {
        const colTasks = sprintTasks.filter((t) => t.status === colName);
        return (
          <div
            key={colName}
            className="bg-sky-50/20 dark:bg-gray-900 border border-sky-100/50 dark:border-gray-800 rounded-2xl p-3 flex flex-col min-h-[160px] max-h-[500px] overflow-y-auto animate-fadeIn"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const taskId = e.dataTransfer.getData("text/plain");
              if (taskId) handleUpdateStatus(taskId, colName);
            }}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 shrink-0 border-b border-sky-50 dark:border-gray-800/80 pb-1.5">
              <span className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                {colName}
              </span>
              <span className="text-[10px] font-black bg-sky-50 text-sky-750 px-2 py-0.5 rounded border dark:bg-gray-850 dark:border-gray-800 dark:text-gray-400">
                {colTasks.length}
              </span>
            </div>

            {/* Column Tasks */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              {colTasks.map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("text/plain", task._id)
                  }
                  onClick={() => {
                    setSelectedTaskToEdit(task);
                    setIsTaskModalOpen(true);
                  }}
                  className="bg-white dark:bg-gray-955 border border-sky-100/40 dark:border-gray-855/60 rounded-xl p-3 shadow-xs hover:border-sky-305 dark:hover:border-sky-850 hover:shadow-xs transition-all cursor-pointer group space-y-2.5 relative"
                >
                  <div className="space-y-1">
                    {task.key && (
                      <span className="text-[8px] font-black uppercase tracking-wider bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-150 select-all inline-block dark:bg-gray-900 dark:border-gray-800">
                        {task.key}
                      </span>
                    )}
                    <h4 className="text-xs font-bold text-gray-805 dark:text-gray-200 group-hover:text-sky-600 line-clamp-2">
                      {task.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-sky-50/20">
                    {/* Epic Badge */}
                    {task.epic && typeof task.epic === "object" ? (
                      <span
                        className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
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
                        <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-850 flex items-center justify-center text-[9px] font-black text-gray-500">
                          {task.storyPoints}
                        </span>
                      )}

                      {/* Assignee Avatar */}
                      {task.assignee ? (
                        <div
                          className="w-5 h-5 rounded-full bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-[8px] font-black text-sky-700 dark:text-sky-400 border border-sky-200"
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
                        <div className="w-5 h-5 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-[8px] text-gray-400">
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
};
