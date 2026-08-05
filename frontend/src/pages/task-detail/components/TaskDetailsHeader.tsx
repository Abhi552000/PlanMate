import React from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "../../../components/ui/Button";

interface TaskDetailsHeaderProps {
  isEditingSubtask: boolean;
  projectKey: string;
  subtaskIndex: number | null;
  onBackToParent: () => void;
  onBackToBoard: () => void;
  onSave: () => void;
  saving: boolean;
}

export const TaskDetailsHeader: React.FC<TaskDetailsHeaderProps> = ({
  isEditingSubtask,
  projectKey,
  subtaskIndex,
  onBackToParent,
  onBackToBoard,
  onSave,
  saving,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 dark:border-gray-800 pb-5">
      <div>
        <button
          onClick={isEditingSubtask ? onBackToParent : onBackToBoard}
          className="group flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 transition-colors bg-sky-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-sky-100/30 dark:border-gray-700 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          {isEditingSubtask ? "Back to Parent Issue" : "Back to Dashboard"}
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 mt-3 flex items-center gap-2">
          <span className="text-gray-400 font-medium select-all">
            {isEditingSubtask ? `${projectKey}-${(subtaskIndex || 0) + 1}` : projectKey}
          </span>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span>{isEditingSubtask ? "Sub-task Detail" : "Issue Details"}</span>
        </h1>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Button
          onClick={onSave}
          loading={saving}
          className="flex items-center gap-1.5 font-bold shadow-sm"
        >
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
};
