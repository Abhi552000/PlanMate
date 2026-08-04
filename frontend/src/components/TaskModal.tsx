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
  BookOpen,
  User,
} from "lucide-react";
import { taskService } from "../services/taskService";
import { orgService } from "../services/orgService";
import { toast } from "react-toastify";
import { ITask, IUser, ISubtask } from "../types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: ITask | null;
  onSave?: (savedTask: ITask) => void;
  onLogout?: () => void;
  statuses?: string[];
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit, onSave, onLogout, statuses = ["To Do", "In Progress", "Done"] }) => {
  const [taskData, setTaskData] = useState<any>({ 
    ...DEFAULT_TASK, 
    subtasks: [] as ISubtask[],
    status: "To Do",
    issueType: "Task",
    storyPoints: 1,
    assignee: "",
    key: ""
  });
  const [members, setMembers] = useState<IUser[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskIdx, setEditingSubtaskIdx] = useState<number | null>(null);
  const [editingSubtaskVal, setEditingSubtaskVal] = useState("");
  const [parentTask, setParentTask] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isOpen) return;
    const fetchMembers = async () => {
      try {
        const data = await orgService.getOrgMembers();
        if (data?.success && data?.members) {
          setMembers(data.members);
        }
      } catch (err) {
        console.error("Error fetching members inside TaskModal:", err);
      }
    };
    fetchMembers();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setParentTask(null);
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
        dueDate: typeof taskToEdit.dueDate === "string" ? taskToEdit.dueDate.split("T")[0] : "",
        completed: normalized,
        id: taskToEdit._id,
        subtasks: taskToEdit.subtasks || [],
        status: taskToEdit.status || "To Do",
        issueType: "Task",
        storyPoints: taskToEdit.storyPoints !== undefined ? taskToEdit.storyPoints : 1,
        assignee: typeof taskToEdit.assignee === "object" && taskToEdit.assignee ? taskToEdit.assignee._id : taskToEdit.assignee || "",
        key: taskToEdit.key || ""
      });
    } else {
      setTaskData({ 
        ...DEFAULT_TASK, 
        subtasks: [],
        status: "To Do",
        issueType: "Task",
        storyPoints: 1,
        assignee: "",
        key: ""
      });
    }
    setNewSubtaskTitle("");
  }, [isOpen, taskToEdit]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSubtask = { 
      title: newSubtaskTitle.trim(), 
      completed: false 
    };
    setTaskData((prev: any) => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), newSubtask],
    }));
    setNewSubtaskTitle("");
  };

  const handleOpenSubtaskDetail = (subtask: any, index: number) => {
    setParentTask({ ...taskData, editingSubtaskIndex: index });
    setTaskData({
      id: subtask._id || `subtask-${index}`,
      title: subtask.title || "",
      description: subtask.description || "",
      priority: subtask.priority || "Low",
      dueDate: typeof subtask.dueDate === "string" ? subtask.dueDate.split("T")[0] : "",
      completed: subtask.completed ? "Yes" : "No",
      status: subtask.status || "To Do",
      issueType: "Sub-task",
      storyPoints: subtask.storyPoints !== undefined ? subtask.storyPoints : 0,
      subtasks: []
    });
  };

  const handleBackToParent = () => {
    if (!parentTask) return;
    const updatedSubtasks = [...parentTask.subtasks];
    const subtaskIdx = parentTask.editingSubtaskIndex;
    if (subtaskIdx !== undefined && updatedSubtasks[subtaskIdx]) {
      updatedSubtasks[subtaskIdx] = {
        ...updatedSubtasks[subtaskIdx],
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        completed: taskData.status === "Done",
        status: taskData.status,
        storyPoints: taskData.storyPoints
      };
    }
    setTaskData({ ...parentTask, subtasks: updatedSubtasks });
    setParentTask(null);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskData((prev: any) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      let finalTaskData = taskData;
      if (parentTask) {
        const updatedSubtasks = [...parentTask.subtasks];
        const subtaskIdx = parentTask.editingSubtaskIndex;
        if (subtaskIdx !== undefined && updatedSubtasks[subtaskIdx]) {
          updatedSubtasks[subtaskIdx] = {
            ...updatedSubtasks[subtaskIdx],
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            dueDate: taskData.dueDate,
            completed: taskData.status === "Done",
            status: taskData.status,
            storyPoints: taskData.storyPoints
          };
        }
        finalTaskData = { ...parentTask, subtasks: updatedSubtasks };
      }

      if (finalTaskData.dueDate && finalTaskData.dueDate < today) {
        toast.error("Due date cannot be in the past");
        return;
      }

      setLoading(true);

      try {
        const isEdit = Boolean(finalTaskData.id);
        const saved = isEdit 
          ? await taskService.updateTask(finalTaskData.id, finalTaskData) 
          : await taskService.createTask(finalTaskData);

        toast.success(isEdit ? "Task updated successfully!" : "Task created successfully!");
        onSave?.(saved);
        onClose();
        setParentTask(null);
      } catch (err: any) {
        if (err?.status === 401) return onLogout?.();
        const msg =
          err?.response?.data?.message || err?.message || "An unexpected error occurred";
        toast.error(msg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [taskData, parentTask, today, onLogout, onSave, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        className="bg-white dark:bg-gray-800/90 border border-sky-100 dark:border-gray-700 rounded-2xl max-w-2xl sm:max-w-3xl lg:max-w-4xl w-full shadow-2xl relative p-6 sm:p-8 animate-fadeIn"
      >
        {parentTask && (
          <button 
            type="button"
            onClick={handleBackToParent}
            className="text-xs font-bold text-sky-600 hover:text-sky-850 mb-3 flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100/70 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer w-fit"
          >
            ← Parent Issue: {parentTask.title}
          </button>
        )}
        <div className=" flex justify-between items-center mb-6 border-b border-sky-100/50 pb-4">
          <div className="space-y-1">
            {taskData.key && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-700 px-2 py-0.5 rounded border border-sky-200 select-all mb-1 inline-block">
                {taskData.key}
              </span>
            )}
            <h2 className=" text-2xl font-bold text-gray-800 dark:text-gray-250 flex items-center gap-2">
              {parentTask ? (
                <>
                  <BookOpen className=" text-sky-500 w-6 h-6" />
                  Sub-task Detail
                </>
              ) : taskData.id ? (
                <Save className=" text-sky-500 w-6 h-6" />
              ) : (
                <PlusCircle className="text-sky-500 w-6 h-6" />
              )}
              {!parentTask && (taskData.id ? "Edit Issue" : "Create New Issue")}
            </h2>
          </div>
          <button
            onClick={() => {
              onClose();
              setParentTask(null);
            }}
            className=" p-2 hover:bg-sky-50 rounded-lg transition-colors text-gray-400 hover:text-sky-700 cursor-pointer"
          >
            <X className=" w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className=" space-y-5">
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* Left side: Main text fields and subtasks */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label className=" block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Summary
                </label>
                <div className=" flex items-center border border-sky-100 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                  <input
                    type="text"
                    name="title"
                    required
                    value={taskData.title}
                    onChange={handleChange}
                    className=" w-full focus:outline-none text-sm text-gray-805 font-medium bg-transparent"
                    placeholder="Provide a brief summary of the issue"
                  />
                </div>
              </div>

              <div>
                <label className=" flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  <AlignLeft className=" w-4 h-4 text-sky-500" /> Description
                </label>
                <textarea
                  rows={5}
                  name="description"
                  value={taskData.description}
                  onChange={handleChange}
                  className={`${baseControlClasses} resize-none text-gray-800`}
                  placeholder="Add details about this issue..."
                />
              </div>

              {parentTask === null && (
                <div>
                  <label className=" flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <CheckCircle className=" w-4 h-4 text-sky-500" /> Subtasks Checklist
                  </label>
                  
                  {/* Scrollable subtasks container */}
                  <div className=" space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(taskData.subtasks || []).map((st: any, index: number) => {
                      const currentStatus = st.status || (st.completed ? "Done" : "To Do");
                      
                      return (
                        <div key={index} className="flex items-center justify-between gap-3 bg-sky-50/30 p-2.5 rounded-lg border border-sky-100/50 text-xs">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {editingSubtaskIdx === index ? (
                              <input
                                type="text"
                                value={editingSubtaskVal}
                                onChange={(e) => setEditingSubtaskVal(e.target.value)}
                                onBlur={() => {
                                  if (editingSubtaskVal.trim()) {
                                    const updated = [...taskData.subtasks];
                                    updated[index].title = editingSubtaskVal.trim();
                                    setTaskData((prev: any) => ({ ...prev, subtasks: updated }));
                                  }
                                  setEditingSubtaskIdx(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (editingSubtaskVal.trim()) {
                                      const updated = [...taskData.subtasks];
                                      updated[index].title = editingSubtaskVal.trim();
                                      setTaskData((prev: any) => ({ ...prev, subtasks: updated }));
                                    }
                                    setEditingSubtaskIdx(null);
                                  }
                                }}
                                className="flex-1 px-2 py-0.5 border border-sky-100 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none text-gray-850 bg-white"
                                autoFocus
                              />
                            ) : (
                              <span 
                                onClick={() => {
                                  setEditingSubtaskIdx(index);
                                  setEditingSubtaskVal(st.title);
                                }}
                                className={`truncate text-gray-700 dark:text-gray-300 font-medium cursor-pointer hover:bg-sky-50 dark:hover:bg-gray-800 px-1 rounded flex-1 ${currentStatus === "Done" ? 'line-through text-gray-400' : ''}`}
                                title="Click to edit summary"
                              >
                                {st.title}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenSubtaskDetail(st, index)}
                              className="text-sky-600 hover:text-sky-800 p-1 hover:bg-sky-50 rounded transition-colors text-[10px] font-bold shrink-0 cursor-pointer"
                              title="Open Sub-task Details"
                            >
                              Open Details
                            </button>

                            <select
                              value={currentStatus}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                const updated = [...taskData.subtasks];
                                updated[index].status = newStatus;
                                updated[index].completed = newStatus.toLowerCase() === "done";
                                setTaskData((prev: any) => ({ ...prev, subtasks: updated }));
                              }}
                              className={`px-1.5 py-0.5 bg-white border border-sky-100 rounded text-[10px] font-bold cursor-pointer focus:outline-none ${
                                currentStatus === "Done" ? "text-green-700 bg-green-50" :
                                currentStatus === "In Progress" ? "text-amber-700 bg-amber-50" :
                                "text-sky-700 bg-sky-50"
                              }`}
                            >
                              {statuses.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => {
                                const updated = taskData.subtasks.filter((_: any, i: number) => i !== index);
                                setTaskData((prev: any) => ({ ...prev, subtasks: updated }));
                              }}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subtask addition form row */}
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Add a new checklist item..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 px-3 py-2 border border-sky-100 dark:border-gray-700 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white dark:bg-gray-900"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSubtask}
                      className="w-full sm:w-auto px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Right side: Jira metadata layout */}
            <div className="md:col-span-5 mt-4 md:mt-0 space-y-4 bg-sky-50/20 p-4 rounded-xl border border-sky-100/50 self-start">
              
              <div>
                <label className=" flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  <CheckCircle className=" w-3.5 h-3.5 text-sky-500" /> Status
                </label>
                <select
                  name="status"
                  value={taskData.status || "To Do"}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setTaskData((prev: any) => ({
                      ...prev,
                      status: newStatus,
                      completed: newStatus.toLowerCase() === "done" ? "Yes" : "No",
                    }));
                  }}
                  className={`${baseControlClasses} font-semibold`}
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className=" flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  <AlignLeft className=" w-3.5 h-3.5 text-sky-500" /> Issue Type
                </label>
                <select
                  name="issueType"
                  value={taskData.issueType || (parentTask ? "Sub-task" : "Task")}
                  onChange={handleChange}
                  disabled={parentTask !== null}
                  className={`${baseControlClasses} font-semibold disabled:bg-gray-50 disabled:text-gray-400`}
                >
                  <option value="Task">Task</option>
                  <option value="Story">Story</option>
                  <option value="Bug">Bug</option>
                  <option value="Epic">Epic</option>
                  {parentTask !== null && <option value="Sub-task">Sub-task</option>}
                </select>
              </div>

              <div>
                <label className=" flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  <Flag className=" w-3.5 h-3.5 text-sky-500" /> Priority
                </label>
                <select
                  name="priority"
                  value={taskData.priority}
                  onChange={handleChange}
                  className={`${baseControlClasses} ${
                    priorityStyles[taskData.priority] || ""
                  } font-semibold`}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              {/* Assignee selection (always visible) */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  <User className="w-3.5 h-3.5 text-sky-500" /> Assignee
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = JSON.parse(localStorage.getItem("currentUser") || "{}");
                      const userMember = members.find(m => m.email === cur.email);
                      if (userMember) {
                        setTaskData((prev: any) => ({ ...prev, assignee: userMember._id }));
                      }
                    }}
                    className="text-[10px] text-sky-600 hover:text-sky-700 hover:underline font-bold transition-all cursor-pointer"
                  >
                    Assign to me
                  </button>
                  <select
                    name="assignee"
                    value={taskData.assignee || ""}
                    onChange={handleChange}
                    className={`${baseControlClasses} font-semibold`}
                  >
                    <option value="">Unassigned</option>
                    {members.map(member => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className=" flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  <Calendar className=" w-3.5 h-3.5 text-sky-500" /> Due Date
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

              <div>
                <label className=" flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  <Flag className=" w-3.5 h-3.5 text-sky-500" /> Story Points
                </label>
                <input
                  type="number"
                  name="storyPoints"
                  min="0"
                  max="100"
                  value={taskData.storyPoints !== undefined ? taskData.storyPoints : 1}
                  onChange={handleChange}
                  className={baseControlClasses}
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Actions footer */}
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
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
