import React, { useCallback, useEffect, useState } from "react";
import {
  baseControlClasses,
  DEFAULT_TASK,
  priorityStyles,
} from "../assets/dummy";
import {
  AlignLeft,
  Calendar,
  CheckCircle,
  Flag,
  PlusCircle,
  Save,
  X,
} from "lucide-react";
import axiosInstance from "../config";

const TaskModal = ({ isOpen, onClose, taskToEdit, onSave, onLogout }) => {
  const [taskData, setTaskData] = useState(DEFAULT_TASK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isOpen) return;
    if (taskToEdit) {
      const normalized =
        taskToEdit.completed === "yes" || taskToEdit.completed === true
          ? "Yes"
          : "No";
      setTaskData({
        ...DEFAULT_TASK,
        title: taskToEdit.title || "",
        description: taskToEdit.description || "",
        priority: taskToEdit.priority || "Low",
        dueDate: taskToEdit.dueDate?.split("T")[0] || "",
        completed: normalized,
        id: taskToEdit._id,
      });
    } else {
      setTaskData(DEFAULT_TASK);
    }
    setError(null);
  }, [isOpen, taskToEdit]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth Token Found");
    return {
      "content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (taskData.dueDate < today) {
        setError("Due date cannot be in the past");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const isEdit = Boolean(taskData.id);
        const url = isEdit ? `/api/tasks/${taskData.id}/gp` : `/api/tasks/gp`;
        const method = isEdit ? "put" : "post";

        const { data: saved } = await axiosInstance[method](url, taskData);

        onSave?.(saved);
        onClose();
      } catch (err) {
        if (err?.status === 401) return onLogout?.();
        const msg =
          err?.data?.message || err?.message || "An unexpected error occurred";
        setError(msg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [taskData, today, onLogout, onSave, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className=" fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center
  p-4"
    >
      <div
        className=" bg-white border border-sky-100 rounded-xl max-w-md w-full shadow-lg
      relative p-6 animate-fadeIn"
      >
        <div className=" flex justify-between items-center mb-6">
          <h2 className=" text-2xl font-bold text-gray-800 flex items-center gap-2">
            {taskData.id ? (
              <Save className=" text-sky-500 w-5 h-5" />
            ) : (
              <PlusCircle className="text-sky-500 w-5 h-5" />
            )}
            {taskData.id ? "Edit Task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className=" p-2 hover:bg-sky-100 rounded-lg transition-colors text-gray-500 hover:text-sky-700"
          >
            <X className=" w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className=" space-y-4">
          {error && (
            <div
              className=" text-sm text-red-600 bg-red-50 p-3 rounded-lg border
            border-red-100"
            >
              {error}
            </div>
          )}
          <div>
            <label className=" block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>

            <div
              className=" flex items-center border border-sky-100 rounded-lg px-3 py-2.5
            focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200"
            >
              <input
                type="text"
                name="title"
                required
                value={taskData.title}
                onChange={handleChange}
                className=" w-full focus:outline-none text-sm"
                placeholder="Enter task title"
              />
            </div>
          </div>

          <div>
            <label className=" flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <AlignLeft className=" w-4 h-4 text-sky-500" /> Description
            </label>

            <textarea
              rows="3"
              name="description"
              value={taskData.description}
              onChange={handleChange}
              className={baseControlClasses}
              placeholder="Add details about your task"
            />
          </div>

          <div className=" grid grid-cols-2 gap-2">
            <div>
              <label className=" flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Flag className=" w-4 h-4 text-sky-500" /> Priority
              </label>
              <select
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
                className={`${baseControlClasses} ${
                  priorityStyles[taskData.priority]
                }`}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className=" flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Calendar className=" w-4 h-4 text-sky-500" /> Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                required
                min={today}
                value={taskData.dueDate}
                onChange={handleChange}
                className={baseControlClasses}
              />
            </div>
          </div>

          <div>
            <label className=" flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
              <CheckCircle className=" w-4 h-4 text-sky-500" /> Status
            </label>
            <div className="flex gap-4">
              {[
                { val: "Yes", label: "Completed" },
                { val: "No", label: "In Progress" },
              ].map(({ val, label }) => (
                <label
                  key={val}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <input
                    type="radio"
                    name="completed"
                    value={val}
                    checked={taskData.completed === val}
                    onChange={handleChange}
                    className="text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                  />

                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className=" w-full bg-gradient-to-r from-cyan-500 to-sky-600 text-white
              font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md transition-all duration-200"
          >
            {loading ? (
              "Saving..."
            ) : taskData.id ? (
              <>
                <Save className=" w-4 h-4" /> Update Task
              </>
            ) : (
              <>
                <PlusCircle className=" w-4 h-4" /> Create Task
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
