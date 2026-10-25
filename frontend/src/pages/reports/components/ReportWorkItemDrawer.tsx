import React from "react";
import { X, ArrowRight, Bug, BookOpen, Award, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ITask } from "../../../types";
import { getPriorityStyle } from "../../../utils";

interface ReportWorkItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  tasks: ITask[];
}

export const ReportWorkItemDrawer: React.FC<ReportWorkItemDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  tasks,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const getWorkTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "bug":
        return <Bug className="w-4 h-4 text-rose-500 fill-rose-500/20 shrink-0" />;
      case "story":
        return <BookOpen className="w-4 h-4 text-emerald-500 fill-emerald-500/20 shrink-0" />;
      case "epic":
        return <Award className="w-4 h-4 text-purple-500 fill-purple-500/20 shrink-0" />;
      default:
        return <CheckSquare className="w-4 h-4 text-sky-500 fill-sky-500/20 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-gray-900 border-l border-sky-100 dark:border-gray-800 shadow-2xl flex flex-col animate-slideInRight">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-sky-50 dark:border-gray-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {title}
                </h3>
              </div>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {subtitle} ({tasks.length} issues)
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Issue Cards List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {tasks.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-xs">
                No matching work items found
              </div>
            ) : (
              tasks.map((task) => {
                const key = task.key || (task._id ? `PM-${task._id.slice(-4).toUpperCase()}` : "TASK");
                const type = task.issueType || "Task";
                const priority = task.priority || "Low";
                const status = task.status || (task.completed ? "Done" : "To Do");

                return (
                  <div
                    key={task._id}
                    className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/50 border border-sky-100/60 dark:border-gray-750 hover:border-sky-300 dark:hover:border-sky-700 shadow-xs transition-all space-y-2.5"
                  >
                    {/* Top row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {getWorkTypeIcon(type)}
                        <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                          {key}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {status}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">
                      {task.title}
                    </h4>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50 text-xs">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityStyle(priority)}`}>
                        {priority}
                      </span>

                      <button
                        onClick={() => {
                          onClose();
                          navigate(`/task/${task._id}`);
                        }}
                        className="flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 cursor-pointer"
                      >
                        <span>Open preview panel</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
