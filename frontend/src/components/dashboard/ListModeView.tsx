import React from "react";
import { CalendarIcon } from "lucide-react";
import { EMPTY_STATE } from "../../assets/dummy";
import TaskItem from "../TaskItem";
import { ITask } from "../../types";

interface ListModeViewProps {
  paginatedTasks: ITask[];
  currentPage: number;
  totalPages: number;
  totalTasksCount: number;
  loadingList: boolean;
  selectedStatus: string;
  onAddTask: () => void;
  onRefresh: () => void;
  onLoadMore: (page: number) => void;
}

export const ListModeView: React.FC<ListModeViewProps> = ({
  paginatedTasks,
  currentPage,
  totalPages,
  totalTasksCount,
  loadingList,
  selectedStatus,
  onAddTask,
  onRefresh,
  onLoadMore,
}) => {
  if (paginatedTasks.length === 0) {
    return (
      <div className={EMPTY_STATE.wrapper}>
        <div className={EMPTY_STATE.iconWrapper}>
          <CalendarIcon className=" w-8 h-8 text-sky-505" />
        </div>

        <h3 className=" text-lg font-semibold text-gray-800 mb-2">No tasks found</h3>
        <p className=" text-sm text-gray-500 mb-4">
          {selectedStatus === "all" ? "Create your first task to get started" : "No tasks match this filter"}
        </p>
        <button onClick={onAddTask} className={EMPTY_STATE.btn}>
          Add New Task
        </button>
      </div>
    );
  }

  return (
    <div className=" space-y-4">
      {paginatedTasks.map((task) => (
        <TaskItem
          key={task._id || task.id}
          task={task}
          onRefresh={onRefresh}
          showCompleteCheckbox
        />
      ))}
      {currentPage < totalPages && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => onLoadMore(currentPage + 1)}
            disabled={loadingList}
            className="px-6 py-2 border-2 border-sky-100 dark:border-gray-800 text-sky-605 dark:text-sky-400 font-bold rounded-xl text-xs hover:bg-sky-50 dark:hover:bg-gray-800 hover:border-sky-305 dark:hover:border-gray-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {loadingList ? "Loading..." : `Load More Tasks (${totalTasksCount - paginatedTasks.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
};
