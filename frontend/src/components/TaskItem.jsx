import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getPriorityColor, MENU_OPTIONS, TI_CLASSES } from "../assets/dummy";
import { Calendar, CheckCircle2, Clock, MoreVertical, Bug, BookOpen, CheckSquare, Award } from "lucide-react";
import { format, isToday } from "date-fns";
import axiosInstance from "../config";

const getPriorityStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-red-600 bg-red-50 border-red-100";
    case "medium":
      return "text-amber-600 bg-amber-50 border-amber-100";
    default:
      return "text-green-600 bg-green-50 border-green-100";
  }
};

const TaskItem = ({
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
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
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

  const handleToggleSubtaskStatus = async (subtaskIndex, newStatus) => {
    const updatedSubtasks = subtasks.map((st, idx) =>
      idx === subtaskIndex 
        ? { ...st, status: newStatus, completed: newStatus === "Done" } 
        : st
    );
    setSubtasks(updatedSubtasks);
    try {
      await axiosInstance.put(`/api/tasks/${task._id}/gp`, {
        subtasks: updatedSubtasks,
      });
      onRefresh?.();
    } catch (error) {
      console.error("Error setting subtask status:", error);
      setSubtasks(subtasks); // Rollback
      if (error.response?.status === 401) onLogout?.();
    }
  };

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

  const handleAction = (action) => {
    setShowMenu(false);
    if (action === "edit") navigate(`/task/${task._id}`);
    if (action === "delete") handleDelete();
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/api/tasks/${task._id}/gp`);
      onRefresh?.();
    } catch (error) {
      if (error.response?.status === 401) onLogout?.();
    }
  };

  const progress = subtasks.length
    ? (subtasks.filter((st) => st.completed || st.status === "Done").length / subtasks.length) * 100
    : 0;

  const completedCount = subtasks.filter((st) => st.completed || st.status === "Done").length;
  const totalCount = subtasks.length;

  return (
    <>
      <div 
        onClick={(e) => {
          if (e.target.closest("button") || e.target.closest("select")) return;
          navigate(`/task/${task._id}`);
        }}
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white hover:bg-sky-50/30 rounded-xl border border-sky-100/70 shadow-sm transition-all duration-200 cursor-pointer gap-3 border-l-4 ${
          task.issueType === "Bug" ? "border-l-red-500" :
          task.issueType === "Story" ? "border-l-green-500" :
          task.issueType === "Epic" ? "border-l-purple-500" :
          "border-l-sky-500"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {task.issueType === "Bug" && <Bug className="w-4 h-4 text-red-500 fill-red-50 shrink-0" />}
          {task.issueType === "Story" && <BookOpen className="w-4 h-4 text-green-500 fill-green-50 shrink-0" />}
          {task.issueType === "Epic" && <Award className="w-4 h-4 text-purple-600 fill-purple-50 shrink-0" />}
          {(!task.issueType || task.issueType === "Task") && <CheckSquare className="w-4 h-4 text-sky-500 fill-sky-50 shrink-0" />}

          <span className="text-xs font-bold text-gray-400 select-all shrink-0">
            {task.key || `PM-${task._id ? task._id.slice(-4).toUpperCase() : "TASK"}`}
          </span>

          <h3 className={`text-sm font-semibold truncate ${
            isCompleted ? "text-gray-400 line-through" : "text-gray-700"
          }`}>
            {task?.title}
          </h3>

          {totalCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-full shrink-0" title="Subtasks checklist progress">
              <CheckCircle2 className="w-3 h-3 text-sky-500" />
              {completedCount}/{totalCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3.5 text-xs shrink-0 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
          {task.assignee && (
            <div 
              className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-extrabold text-[9px] border border-sky-200 uppercase shrink-0" 
              title={`Assigned to: ${task.assignee.name} (${task.assignee.email})`}
            >
              {task.assignee.name.split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2)}
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
            className={`px-2 py-1 rounded text-xs font-bold border border-sky-100 cursor-pointer focus:outline-none ${
              task.status === "Done" || task.completed ? "text-green-700 bg-green-50" :
              task.status === "In Progress" ? "text-amber-700 bg-amber-50" :
              "text-sky-700 bg-sky-50"
            }`}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
            {task.priority || "Low"}
          </span>

          <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full" title="Story Points">
            {task.storyPoints !== undefined ? task.storyPoints : 1} SP
          </span>

          <div className={`flex items-center gap-1 font-semibold ${
            task.dueDate && isToday(new Date(task.dueDate)) ? "text-cyan-600" : "text-gray-500"
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
              className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 bg-white border border-sky-100 rounded-lg shadow-lg py-1 z-10 w-32 animate-fadeIn">
                {MENU_OPTIONS.map((opt) => (
                  <button
                    key={opt.action}
                    onClick={() => handleAction(opt?.action)}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-sky-50 flex items-center gap-2 transition-colors duration-200 text-gray-700"
                  >
                    {opt?.icon}
                    {opt?.label}
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
