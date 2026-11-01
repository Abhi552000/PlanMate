import React from "react";
import { ITask, KanbanColumnProps } from "../../types";
import { KanbanCard } from "./KanbanCard";
import { KANBAN_TEXTS } from "../../constants/uiTexts";

export const KanbanColumn: React.FC<KanbanColumnProps> = React.memo(({
  col,
  columns,
  colTasks,
  loading = false,
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
            {loading && colTasks.length === 0 ? "..." : colTasks.length}
          </span>
        </div>
      </div>

      {/* Column Cards */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1.5 scrollbar-thin">
        {loading && colTasks.length === 0 ? (
          <div className="space-y-3 select-none">
            {[1, 2].map((idx) => (
              <div
                key={idx}
                className="bg-white/80 dark:bg-gray-800/80 border border-sky-100/80 dark:border-gray-800 rounded-xl p-3.5 space-y-3 shadow-2xs animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
                <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="h-3 w-14 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
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
                  {KANBAN_TEXTS.NO_ISSUES}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
});
