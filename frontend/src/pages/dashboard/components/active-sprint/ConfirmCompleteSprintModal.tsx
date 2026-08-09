import React from "react";
import { X } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { ACTIVE_SPRINT_TEXTS } from "../../../../constants/uiTexts";
import { ConfirmCompleteSprintModalProps } from "../../../../types";

export const ConfirmCompleteSprintModal: React.FC<
  ConfirmCompleteSprintModalProps
> = ({
  showConfirmComplete,
  setShowConfirmComplete,
  completingSprint,
  handleConfirmComplete,
}) => {
  if (!showConfirmComplete) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-black/35 z-55 flex items-center justify-center p-4"
      onClick={() => setShowConfirmComplete(false)}
    >
      <div 
        className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-sky-50 dark:border-gray-850 pb-2">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
            {ACTIVE_SPRINT_TEXTS.MODAL_COMPLETE_SPRINT_TITLE}
          </h3>
          <button
            type="button"
            onClick={() => setShowConfirmComplete(false)}
            className="text-gray-405 hover:text-sky-600 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-405 leading-normal">
          {ACTIVE_SPRINT_TEXTS.MODAL_COMPLETE_SPRINT_DESC}
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmComplete(false)}
          >
            {ACTIVE_SPRINT_TEXTS.BTN_CANCEL}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirmComplete}
            loading={completingSprint}
          >
            {ACTIVE_SPRINT_TEXTS.BTN_CONFIRM}
          </Button>
        </div>
      </div>
    </div>
  );
};
