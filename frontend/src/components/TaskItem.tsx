import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getPriorityColor, MENU_OPTIONS } from "../assets/dummy";
import { Calendar, CheckCircle2, MoreVertical, Bug, BookOpen, CheckSquare, Award } from "lucide-react";
import { format, isToday } from "date-fns";
import axiosInstance from "../config";
import { ITask } from "../types";

const getPriorityStyle = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-red-600 bg-red-50 border-red-100";
    case "medium":
      return "text-amber-600 bg-amber-50 border-amber-100";
    default:
      return "text-green-600 bg-green-50 border-green-100";
  }
};

interface TaskItemProps {
  task: ITask;
  onRefresh?: () => void;
  onLogout?: () => void;
  showCompleteCheckbox?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onRefresh,
  onLogout,
  showCompleteCheckbox = true,
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(
    [true, 1, "yes"].includes(
      typeof task.completed === "string"
        ? task.completed.toLowerCase()
        : task.completed
    )
  );
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    setSubtasks(task.subtasks || []);
  }, [task.subtasks]);

  useEffect(() => {
    setIsCompleted(
      [true, 1, "yes"].includes(
        typeof task.completed === "string"
          ? task.completed.toLowerCase()
          : task.completed
      )
    );
  }, [task.completed]);

  const handleAction = (action: string) => {
    setShowMenu(false);
    if (action === "edit") navigate(`/task/${task._id}`);
    if (action === "delete") handleDelete();
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/tasks/${task._id}/gp`);
      onRefresh?.();
    } catch (error: any) {
      if (error.response?.status === 401) onLogout?.();
    }
  };

  const completedCount = subtasks.filter((st) => st.completed).length;
  const totalCount = subtasks.length;

  return (
    <>
      <div 
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("button") || target.closest("select")) return;
          navigate(`/task/${task._id}`);
        }}
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white dark:bg-gray-900 hover:bg-sky-50/30 dark:hover:bg-gray-800/35 rounded-xl border border-sky-100/70 dark:border-gray-800 shadow-sm transition-all duration-200 cursor-pointer gap-3 border-l-4 ${
          task.priority === "High" ? "border-l-red-500" :
          task.priority === "Medium" ? "border-l-amber-500" :
          "border-l-green-500"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <CheckSquare className="w-4 h-4 text-sky-500 fill-sky-50 dark:fill-sky-950/20 shrink-0" />

          <span className="text-xs font-bold text-gray-400 select-all shrink-0">
            {task.key || `PM-${task._id ? task._id.slice(-4).toUpperCase() : "TASK"}`}
          </span>

          <h3 className={`text-sm font-semibold truncate ${
            isCompleted ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-200"
          }`}>
            {task?.title}
          </h3>

          {totalCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400 px-1.5 py-0.5 rounded-full shrink-0" title="Subtasks checklist progress">
              <CheckCircle2 className="w-3 h-3 text-sky-500" />
              {completedCount}/{totalCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3.5 text-xs shrink-0 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
          {task.assignee && (
            <div 
              className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 flex items-center justify-center font-extrabold text-[9px] border border-sky-200 dark:border-gray-800 uppercase shrink-0" 
              title={`Assigned to: ${typeof task.assignee === 'object' ? task.assignee.name : 'Team Member'}`}
            >
              {typeof task.assignee === 'object' && task.assignee.name
                ? task.assignee.name.split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2)
                : "U"}
            </div>
          )}

          <select
            value={task.status || (isCompleted ? "Done" : "To Do")}
            onChange={async (e) => {
              const newStatus = e.target.value;
              try {
                await axiosInstance.put(`/api/tasks/${task._id}/gp`, {
                  status: newStatus,
                  completed: newStatus === "Done" ? "Yes" : "No"
                });
                onRefresh?.();
              } catch (error) {
                console.error("Error setting status:", error);
              }
            }}
            className={`px-2 py-1 rounded text-xs font-bold border border-sky-100 dark:border-gray-800 cursor-pointer focus:outline-none bg-white dark:bg-gray-900 ${
              task.status === "Done" || task.completed ? "text-green-700 bg-green-50 dark:bg-green-950/20" :
              task.status === "In Progress" ? "text-amber-700 bg-amber-50 dark:bg-amber-950/20" :
              "text-sky-700 bg-sky-50 dark:bg-sky-950/20"
            }`}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
            {task.priority || "Low"}
          </span>

          <div className={`flex items-center gap-1 font-semibold ${
            task.dueDate && isToday(new Date(task.dueDate)) ? "text-cyan-600" : "text-gray-500 dark:text-gray-400"
          }`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {task.dueDate
                ? isToday(new Date(task.dueDate))
                  ? "Today"
                  : format(new Date(task.dueDate), "MMM dd")
                : "-"}
            </span>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-lg shadow-lg py-1 z-10 w-32 animate-fadeIn">
                {MENU_OPTIONS.map((opt) => (
                  <button
                    key={opt.action}
                    onClick={() => handleAction(opt.action)}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-sky-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors duration-200 text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskItem;
