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
      className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-sky-100 dark:border-gray-800 max-w-sm w-full p-6 space-y-4 animate-scaleUp animate-duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-gray-855 dark:text-gray-150 text-base">
          Confirm Status Deletion
        </h3>

        {isCheckingTasks ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="w-6 h-6 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 font-semibold">Checking workspace tasks...</p>
          </div>
        ) : tasksCountForStatus !== null && tasksCountForStatus > 0 ? (
          <div className="space-y-3">
            <div className="bg-red-50/50 dark:bg-red-950/15 border border-red-100 dark:border-red-900/50 p-3 rounded-xl text-xs text-red-700 dark:text-red-400 font-semibold leading-relaxed">
              ⚠️ Cannot delete status <strong>"{statusToDelete}"</strong> because it is currently assigned to <strong>{tasksCountForStatus} task(s)</strong> in this workspace. You must move or reassign these tasks before you can remove this status.
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-550 dark:text-gray-405 leading-normal">
            Are you sure you want to delete the status <strong>"{statusToDelete}"</strong>? Tasks currently in this status will fall back to their default workflow. This action cannot be undone.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-sky-50 dark:border-gray-800">
          <button
            type="button"
            onClick={() => {
              setStatusToDelete(null);
              setTasksCountForStatus(null);
            }}
            className="px-4 py-2 border border-sky-200 dark:border-gray-800 text-gray-650 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-800 font-bold rounded-lg text-xs transition-colors cursor-pointer bg-white dark:bg-gray-900"
          >
            {tasksCountForStatus !== null && tasksCountForStatus > 0 ? "Close" : "Cancel"}
          </button>
          {!(tasksCountForStatus !== null && tasksCountForStatus > 0) && (
            <button
              type="button"
              disabled={deletingStatus !== null || isCheckingTasks}
              onClick={() => handleDeleteStatus(statusToDelete)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {deletingStatus ? "Deleting..." : "Confirm Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
