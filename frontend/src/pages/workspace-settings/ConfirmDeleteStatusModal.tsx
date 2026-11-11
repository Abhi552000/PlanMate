import React from "react";
import { ConfirmDeleteStatusModalProps } from "../../types";
import { WORKSPACE_SETTINGS_TEXTS } from "../../constants/uiTexts";
import { Button } from "../../components/ui/Button";

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
      className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 space-y-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-bold text-slate-900 dark:text-white text-base">
          {WORKSPACE_SETTINGS_TEXTS.MODAL_DELETE_STATUS_TITLE}
        </h3>

        {isCheckingTasks ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="w-6 h-6 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-semibold">{WORKSPACE_SETTINGS_TEXTS.CHECKING_TASKS}</p>
          </div>
        ) : tasksCountForStatus !== null && tasksCountForStatus > 0 ? (
          <div className="space-y-3">
            <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/60 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
              Cannot delete status <span className="font-bold text-sky-600 dark:text-sky-400">"{statusToDelete}"</span> because it is currently assigned to <strong>{tasksCountForStatus} task(s)</strong> in this workspace. Please reassign these tasks first.
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal">
            Are you sure you want to delete status <span className="font-bold text-sky-600 dark:text-sky-400">"{statusToDelete}"</span>? Tasks currently in this status will fall back to their default workflow. This action cannot be undone.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleClose}
          >
            {tasksCountForStatus !== null && tasksCountForStatus > 0 ? WORKSPACE_SETTINGS_TEXTS.BTN_CLOSE : WORKSPACE_SETTINGS_TEXTS.BTN_CANCEL}
          </Button>
          {!(tasksCountForStatus !== null && tasksCountForStatus > 0) && (
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isCheckingTasks}
              loading={deletingStatus !== null}
              onClick={() => handleDeleteStatus(statusToDelete)}
            >
              {deletingStatus ? WORKSPACE_SETTINGS_TEXTS.BTN_DELETING_STATUS : WORKSPACE_SETTINGS_TEXTS.BTN_DELETE_STATUS}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
