import React from "react";
import { ConfirmDeleteStatusModalProps } from "../../types";

export const ConfirmDeleteStatusModal: React.FC<ConfirmDeleteStatusModalProps> = ({
  statusToDelete,
  isCheckingTasks,
  tasksCountForStatus,
  deletingStatus,
  setStatusToDelete,
  setTasksCountForStatus,
  handleDeleteStatus,
}) => {
  if (!statusToDelete) return null;

  const handleClose = () => {
    setStatusToDelete(null);
    setTasksCountForStatus(null);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800 max-w-sm w-full p-6 space-y-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
          Delete Status
        </h3>

        {isCheckingTasks ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="w-6 h-6 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 font-semibold">Checking workspace tasks...</p>
          </div>
        ) : tasksCountForStatus !== null && tasksCountForStatus > 0 ? (
          <div className="space-y-3">
            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/60 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
              Cannot delete status <span className="font-bold text-sky-600 dark:text-sky-400">"{statusToDelete}"</span> because it is currently assigned to <strong>{tasksCountForStatus} task(s)</strong> in this workspace. Please reassign these tasks first.
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal">
            Are you sure you want to delete status <span className="font-bold text-sky-600 dark:text-sky-400">"{statusToDelete}"</span>? Tasks currently in this status will fall back to their default workflow. This action cannot be undone.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer bg-white dark:bg-gray-900"
          >
            {tasksCountForStatus !== null && tasksCountForStatus > 0 ? "Close" : "Cancel"}
          </button>
          {!(tasksCountForStatus !== null && tasksCountForStatus > 0) && (
            <button
              type="button"
              disabled={deletingStatus !== null || isCheckingTasks}
              onClick={() => handleDeleteStatus(statusToDelete)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {deletingStatus ? "Deleting..." : "Delete Status"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
