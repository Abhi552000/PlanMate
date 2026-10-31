import React from "react";
import { Save, PlusCircle } from "lucide-react";
import { TaskModalFooterProps } from "../../types";

export const TaskModalFooter: React.FC<TaskModalFooterProps> = ({
  loading,
  parentTask,
  taskData,
  onClose,
  setParentTask,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2.5 justify-end pt-1">
      <button
        type="button"
        onClick={() => {
          onClose();
          setParentTask(null);
        }}
        className="w-full sm:w-auto px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800 font-medium rounded-lg text-xs sm:text-sm transition-colors cursor-pointer bg-white dark:bg-gray-800"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-medium py-2 px-5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors cursor-pointer text-xs sm:text-sm"
      >
        {loading ? (
          "Saving..."
        ) : parentTask ? (
          <>
            <Save className="w-4 h-4" /> Save Sub-task
          </>
        ) : taskData.id ? (
          <>
            <Save className="w-4 h-4" /> Save Changes
          </>
        ) : (
          <>
            <PlusCircle className="w-4 h-4" /> Create Issue
          </>
        )}
      </button>
    </div>
  );
};
