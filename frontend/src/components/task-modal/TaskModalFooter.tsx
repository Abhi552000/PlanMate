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
    <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-sky-100 dark:border-gray-800 mt-6">
      <button
        type="button"
        onClick={() => {
          onClose();
          setParentTask(null);
        }}
        className="w-full sm:w-auto px-5 py-2.5 border border-sky-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-800 font-bold rounded-lg text-sm transition-colors cursor-pointer bg-white dark:bg-gray-900"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md transition-all duration-200 cursor-pointer text-sm"
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
