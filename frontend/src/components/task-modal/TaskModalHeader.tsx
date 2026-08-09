import React from "react";
import { BookOpen, Save, PlusCircle, X } from "lucide-react";
import { TaskModalHeaderProps } from "../../types";

export const TaskModalHeader: React.FC<TaskModalHeaderProps> = ({
  parentTask,
  taskData,
  handleBackToParent,
  onClose,
  setParentTask,
}) => {
  return (
    <>
      {parentTask && (
        <button
          type="button"
          onClick={handleBackToParent}
          className="text-xs font-bold text-sky-600 hover:text-sky-850 mb-3 flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100/70 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer w-fit"
        >
          ← Parent Issue: {parentTask.title}
        </button>
      )}
      <div className="flex justify-between items-center mb-6 border-b border-sky-100/50 pb-4">
        <div className="space-y-1">
          {taskData.key && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-700 px-2 py-0.5 rounded border border-sky-200 select-all mb-1 inline-block">
              {taskData.key}
            </span>
          )}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-255 flex items-center gap-2">
            {parentTask ? (
              <>
                <BookOpen className="text-sky-505 w-6 h-6" />
                Sub-task Detail
              </>
            ) : taskData.id ? (
              <Save className="text-sky-505 w-6 h-6" />
            ) : (
              <PlusCircle className="text-sky-505 w-6 h-6" />
            )}
            {!parentTask && (taskData.id ? "Edit Issue" : "Create New Issue")}
          </h2>
        </div>
        <button
          onClick={() => {
            onClose();
            setParentTask(null);
          }}
          type="button"
          className="p-2 hover:bg-sky-50 rounded-lg transition-colors text-gray-400 hover:text-sky-700 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};
