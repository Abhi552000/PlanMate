import React from "react";
import { BookOpen, Save, PlusCircle, X, ExternalLink, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TaskModalHeaderProps } from "../../types";
import { getIssueTypeIcon } from "../../utils";

export const TaskModalHeader: React.FC<TaskModalHeaderProps> = ({
  parentTask,
  taskData,
  handleBackToParent,
  onClose,
  setParentTask,
}) => {
  const navigate = useNavigate();

  const handleOpenFullPage = () => {
    if (taskData.id) {
      onClose();
      navigate(`/task/${taskData.id}`);
    }
  };

  const ticketKey =
    taskData.key || (taskData.id ? `PM-${taskData.id.slice(-4).toUpperCase()}` : null);
  const ticketLink = ticketKey ? `${window.location.origin}/${ticketKey}` : "";

  const handleCopyLink = () => {
    if (ticketLink) {
      navigator.clipboard.writeText(ticketLink);
      toast.success(`Copied ticket link (${ticketLink})`);
    }
  };

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
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          {ticketKey && (
            <div
              onClick={handleCopyLink}
              className="group/key flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 px-2 py-0.5 rounded border border-sky-200/60 dark:border-sky-800 transition-colors cursor-pointer w-fit"
              title={`Click to copy ticket link (${ticketLink})`}
            >
              {getIssueTypeIcon(taskData.issueType, "w-3.5 h-3.5")}
              <span className="text-[11px] font-bold tracking-wider text-sky-700 dark:text-sky-300 select-all inline-block">
                {ticketKey}
              </span>
              <Copy className="w-3 h-3 text-sky-400 group-hover/key:text-sky-700 dark:group-hover/key:text-sky-200 transition-colors" />
            </div>
          )}
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {parentTask
              ? "Sub-task Detail"
              : taskData.id
              ? "Edit Issue"
              : "Create New Issue"}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {taskData.id && (
            <button
              type="button"
              onClick={handleOpenFullPage}
              className="p-2 hover:bg-sky-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-sky-700 dark:hover:text-sky-300 cursor-pointer"
              title="Open full page"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              onClose();
              setParentTask(null);
            }}
            type="button"
            className="p-2 hover:bg-sky-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-sky-700 dark:hover:text-gray-200 cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
