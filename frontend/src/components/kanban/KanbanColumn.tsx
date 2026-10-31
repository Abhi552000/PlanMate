import React from "react";
import { ITask, KanbanColumnProps } from "../../types";
import { KanbanCard } from "./KanbanCard";

export const KanbanColumn: React.FC<KanbanColumnProps> = React.memo(({
  col,
  columns,
  colTasks,
  activeOverColumn,
  handleDragOver,
  handleDragEnter,
  handleDragLeave,
  handleDrop,
  handleDragStart,
  handleStatusTransition,
  navigate,
}) => {
  return (
    <div
      onDragOver={(e) => handleDragOver(e, col)}
      onDragEnter={(e) => handleDragEnter(e, col)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, col)}
      className={`border rounded-xl p-3.5 sm:p-4 flex flex-col min-h-[480px] snap-center w-[85vw] min-w-[270px] max-w-[340px] md:max-w-none md:w-full shrink-0 shadow-sm transition-all duration-200 ${
        activeOverColumn === col
          ? "bg-sky-100/70 dark:bg-sky-950/20 border-sky-300 dark:border-sky-700"
          : "bg-gray-50/70 dark:bg-gray-900/50 border-sky-100 dark:border-gray-800"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-sky-100/50 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-700 dark:text-gray-300 text-sm tracking-wide uppercase">
            {col}
          </h2>
          <span className="bg-sky-100/80 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded-full text-xs font-semibold">
            {colTasks.length}
          </span>
        </div>
      </div>

      {/* Column Cards */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1.5 scrollbar-thin">
        {colTasks.map((task) => (
          <KanbanCard
            key={task._id}
            task={task}
            col={col}
            columns={columns}
            navigate={navigate}
            handleDragStart={handleDragStart}
            handleStatusTransition={handleStatusTransition}
          />
        ))}

        {colTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-sky-100 dark:border-gray-800 rounded-lg bg-white/50 dark:bg-gray-900/50 text-center">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              No issues in this status
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
