import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  Bug, 
  BookOpen, 
  CheckSquare, 
  Award, 
  Calendar, 
  CheckCircle, 
  Flag, 
  AlignLeft, 
  Save, 
  ArrowLeft,
  X,
  Trash2,
  Clock,
  Plus,
  User,
  Activity
} from "lucide-react";
import axiosInstance from "../config";

const getIssueTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "bug":
      return <Bug className="w-5 h-5 text-red-500 fill-red-50" />;
    case "story":
      return <BookOpen className="w-5 h-5 text-green-500 fill-green-50" />;
    case "epic":
      return <Award className="w-5 h-5 text-purple-600 fill-purple-50" />;
    default:
      return <CheckSquare className="w-5 h-5 text-sky-500 fill-sky-50" />;
  }
};

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

const baseControlClasses =
  "w-full px-3 py-2 border border-sky-100 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200";

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const subtaskIndexParam = searchParams.get("subtask");
  const subtaskIndex = subtaskIndexParam !== null ? parseInt(subtaskIndexParam, 10) : null;

  const [parentTaskData, setParentTaskData] = useState(null);
  const [members, setMembers] = useState([]);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: "",
    completed: "No",
    status: "To Do",
    issueType: "Task",
    storyPoints: 1,
    assignee: "",
    subtasks: []
  });

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskIdx, setEditingSubtaskIdx] = useState(null);
  const [editingSubtaskVal, setEditingSubtaskVal] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const today = new Date().toISOString().split("T")[0];

  // Fetch parent task data
  const fetchTask = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get(`/api/tasks/${id}/gp`);
      if (data?.task) {
        setParentTaskData(data.task);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Failed to load issue details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  // Fetch organization members to populate assignee dropdown
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data } = await axiosInstance.get("/api/organization/members");
        if (data?.success && data?.members) {
          setMembers(data.members);
        }
      } catch (err) {
        console.error("Error fetching members inside TaskDetailPage:", err);
      }
    };
    fetchMembers();
  }, []);

  // Sync active task fields (depends on parent task data and subtaskIndex)
  useEffect(() => {
    if (!parentTaskData) return;

    if (subtaskIndex !== null && parentTaskData.subtasks?.[subtaskIndex]) {
      // Editing subtask
      const st = parentTaskData.subtasks[subtaskIndex];
      setTaskData({
        title: st.title || "",
        description: st.description || "",
        priority: st.priority || "Low",
        dueDate: st.dueDate ? st.dueDate.split("T")[0] : "",
        completed: st.completed ? "Yes" : "No",
        status: st.status || "To Do",
        issueType: st.issueType || "Sub-task",
        storyPoints: st.storyPoints !== undefined ? st.storyPoints : 0,
        assignee: "",
        subtasks: []
      });
    } else {
      // Editing parent task
      setTaskData({
        title: parentTaskData.title || "",
        description: parentTaskData.description || "",
        priority: parentTaskData.priority || "Low",
        dueDate: parentTaskData.dueDate ? parentTaskData.dueDate.split("T")[0] : "",
        completed: parentTaskData.completed ? "Yes" : "No",
        status: parentTaskData.status || "To Do",
        issueType: parentTaskData.issueType || "Task",
        storyPoints: parentTaskData.storyPoints !== undefined ? parentTaskData.storyPoints : 1,
        assignee: parentTaskData.assignee?._id || parentTaskData.assignee || "",
        subtasks: parentTaskData.subtasks || []
      });
    }
  }, [parentTaskData, subtaskIndex]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim() || !parentTaskData) return;
    const newSubtask = { 
      title: newSubtaskTitle.trim(), 
      status: "To Do",
      completed: false 
    };
    
    const updatedSubtasks = [...(parentTaskData.subtasks || []), newSubtask];
    setParentTaskData(prev => ({ ...prev, subtasks: updatedSubtasks }));
    setNewSubtaskTitle("");
  };

  const handleSave = async () => {
    if (!parentTaskData) return;
    if (taskData.dueDate && taskData.dueDate < today) {
      setError("Due date cannot be in the past");
      return;
    }

    setSaving(true);
    setError(null);

    // Merge changes
    let finalParentData = { ...parentTaskData };
    if (subtaskIndex !== null) {
      const updatedSubtasks = [...parentTaskData.subtasks];
      updatedSubtasks[subtaskIndex] = {
        ...updatedSubtasks[subtaskIndex],
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        completed: taskData.status === "Done",
        status: taskData.status,
        storyPoints: taskData.storyPoints
      };
      finalParentData.subtasks = updatedSubtasks;
    } else {
      finalParentData = {
        ...finalParentData,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        completed: taskData.status === "Done",
        status: taskData.status,
        issueType: taskData.issueType,
        storyPoints: taskData.storyPoints,
        assignee: taskData.assignee || null,
        subtasks: taskData.subtasks
      };
    }

    try {
      const { data } = await axiosInstance.put(`/api/tasks/${id}/gp`, finalParentData);
      if (data?.task) {
        setParentTaskData(data.task);
        if (subtaskIndex !== null) {
          // Stay on subtask, or redirect to parent
          setSearchParams({});
        }
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || err?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    try {
      await axiosInstance.delete(`/api/tasks/${id}/gp`);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Failed to delete issue");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-semibold">Loading issue details...</p>
      </div>
    );
  }

  const isEditingSubtask = subtaskIndex !== null;
  const projectKey = `PM-${id.slice(-4).toUpperCase()}`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <button onClick={() => navigate("/")} className="hover:text-sky-600 transition-colors">
            Projects
          </button>
          <span>/</span>
          <button onClick={() => navigate("/")} className="hover:text-sky-600 transition-colors">
            PlanMate
          </button>
          <span>/</span>
          {isEditingSubtask ? (
            <>
              <button 
                onClick={() => setSearchParams({})} 
                className="hover:text-sky-600 transition-colors"
              >
                {projectKey}
              </button>
              <span>/</span>
              <span className="text-gray-800 font-bold">Sub-task Details</span>
            </>
          ) : (
            <span className="text-gray-800 font-bold">{projectKey}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 border border-sky-200 dark:border-gray-800 text-gray-650 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-800 font-bold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer bg-white dark:bg-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Board
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold rounded-lg text-sm flex items-center gap-1.5 hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              "Saving..."
            ) : isEditingSubtask ? (
              <>
                <Save className="w-4 h-4" /> Save Sub-task
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>

        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Summary & Description */}
        <div className="lg:col-span-7 space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-sky-100/50 shadow-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Summary
            </label>
            <div className="flex items-center border border-sky-100 rounded-lg px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
              <input
                type="text"
                name="title"
                required
                value={taskData.title}
                onChange={handleChange}
                className="w-full focus:outline-none text-base text-gray-800 font-semibold"
                placeholder="Summary title of the issue"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              <AlignLeft className="w-4 h-4 text-sky-500" /> Description
            </label>
            <textarea
              rows="8"
              name="description"
              value={taskData.description}
              onChange={handleChange}
              className={`${baseControlClasses} resize-none text-gray-800 text-sm`}
              placeholder="Add comprehensive details about this issue..."
            />
          </div>

          {/* Subtask Section (Only visible on parent issue detail) */}
          {!isEditingSubtask && (
            <div className="border-t border-sky-100/50 pt-5">
              <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                <CheckCircle className="w-4 h-4 text-sky-500" /> Sub-tasks Checklist
              </label>

              {/* Scrollable Subtasks Table-like List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(parentTaskData.subtasks || []).map((st, index) => {
                  const currentStatus = st.status || (st.completed ? "Done" : "To Do");
                  const subtaskKey = `${projectKey}-${index + 1}`;

                  return (
                    <div key={index} className="flex items-center justify-between gap-3 bg-sky-50/20 hover:bg-sky-50/40 p-2.5 rounded-xl border border-sky-100/40 text-xs transition-colors">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-gray-400 select-all shrink-0">
                          {subtaskKey}
                        </span>
                        
                        {editingSubtaskIdx === index ? (
                          <input
                            type="text"
                            value={editingSubtaskVal}
                            onChange={(e) => setEditingSubtaskVal(e.target.value)}
                            onBlur={() => {
                              if (editingSubtaskVal.trim()) {
                                const updated = [...parentTaskData.subtasks];
                                updated[index].title = editingSubtaskVal.trim();
                                setParentTaskData(prev => ({ ...prev, subtasks: updated }));
                              }
                              setEditingSubtaskIdx(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (editingSubtaskVal.trim()) {
                                  const updated = [...parentTaskData.subtasks];
                                  updated[index].title = editingSubtaskVal.trim();
                                  setParentTaskData(prev => ({ ...prev, subtasks: updated }));
                                }
                                setEditingSubtaskIdx(null);
                              }
                            }}
                            className="flex-1 px-2 py-0.5 border border-sky-100 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none text-gray-800 bg-white font-medium"
                            autoFocus
                          />
                        ) : (
                          <span 
                            onClick={() => {
                              setEditingSubtaskIdx(index);
                              setEditingSubtaskVal(st.title);
                            }}
                            className={`truncate text-gray-700 font-semibold cursor-pointer hover:bg-sky-50 px-1 rounded flex-1 ${currentStatus === "Done" ? 'line-through text-gray-400 font-medium' : ''}`}
                            title="Click to edit summary"
                          >
                            {st.title}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSearchParams({ subtask: index })}
                          className="text-sky-600 hover:text-sky-800 p-1 hover:bg-sky-50 rounded transition-colors text-[10px] font-bold"
                          title="Open Sub-task Details"
                        >
                          Open Details
                        </button>

                        <select
                          value={currentStatus}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            const updated = [...parentTaskData.subtasks];
                            updated[index].status = newStatus;
                            updated[index].completed = newStatus === "Done";
                            setParentTaskData(prev => ({ ...prev, subtasks: updated }));
                          }}
                          className={`px-1.5 py-0.5 bg-white border border-sky-100 rounded text-[10px] font-bold cursor-pointer focus:outline-none ${
                            currentStatus === "Done" ? "text-green-700 bg-green-50" :
                            currentStatus === "In Progress" ? "text-amber-700 bg-amber-50" :
                            "text-sky-700 bg-sky-50"
                          }`}
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = parentTaskData.subtasks.filter((_, i) => i !== index);
                            setParentTaskData(prev => ({ ...prev, subtasks: updated }));
                          }}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Subtask form */}
              <div className="flex gap-2 mt-3.5">
                <input
                  type="text"
                  placeholder="Create sub-task..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 px-3 py-2 border border-sky-100 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
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
                  className="px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>
          )}

          {/* Activity Timeline (only for parent task) */}
          {!isEditingSubtask && parentTaskData.history && parentTaskData.history.length > 0 && (
            <div className="border-t border-sky-100/50 pt-5 mt-5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                <Activity className="w-4 h-4 text-sky-500" /> Activity Timeline
              </label>
              
              <div className="relative pl-6 border-l border-sky-100 dark:border-gray-800 space-y-5 ml-2">
                {parentTaskData.history.map((item, idx) => (
                  <div key={idx} className="relative text-xs">
                    {/* Timeline bullet indicator */}
                    <div className="absolute -left-[32px] top-1 w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-white dark:border-gray-900 shadow-sm" />
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-gray-650 dark:text-gray-400">
                        <span className="font-bold text-gray-800 dark:text-gray-250">
                          {item.updatedBy?.name || "Someone"}
                        </span>
                        <span>updated the</span>
                        <span className="font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider text-[10px] bg-sky-50 dark:bg-sky-950/20 px-1.5 py-0.5 rounded border border-sky-100 dark:border-sky-900/50">
                          {item.field}
                        </span>
                      </div>
                      
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 bg-gray-50/50 dark:bg-gray-900/50 p-2 rounded-lg border border-sky-100/30 dark:border-gray-850 w-fit">
                        <span className="line-through text-red-600 dark:text-red-405">{item.oldValue || "None"}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-bold text-green-700 dark:text-green-400">{item.newValue || "None"}</span>
                      </div>
                      
                      {item.updatedAt && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {new Date(item.updatedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Meta Fields */}
        <div className="lg:col-span-5 space-y-4 bg-white p-5 sm:p-6 rounded-2xl border border-sky-100/50 shadow-sm self-start">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-sky-100/50 pb-2">
            Details
          </h3>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-sky-500" /> Status
            </label>
            <select
              name="status"
              value={taskData.status || "To Do"}
              onChange={(e) => {
                const newStatus = e.target.value;
                setTaskData((prev) => ({
                  ...prev,
                  status: newStatus,
                  completed: newStatus === "Done" ? "Yes" : "No",
                }));
              }}
              className={`${baseControlClasses} font-semibold`}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              <AlignLeft className="w-3.5 h-3.5 text-sky-500" /> Issue Type
            </label>
            <select
              name="issueType"
              value={taskData.issueType || (isEditingSubtask ? "Sub-task" : "Task")}
              onChange={handleChange}
              disabled={isEditingSubtask}
              className={`${baseControlClasses} font-semibold disabled:bg-gray-50 disabled:text-gray-400`}
            >
              <option value="Task">Task</option>
              <option value="Story">Story</option>
              <option value="Bug">Bug</option>
              <option value="Epic">Epic</option>
              {isEditingSubtask && <option value="Sub-task">Sub-task</option>}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              <Flag className="w-3.5 h-3.5 text-sky-500" /> Priority
            </label>
            <select
              name="priority"
              value={taskData.priority}
              onChange={handleChange}
              className={`${baseControlClasses} ${
                getPriorityStyle(taskData.priority)
              } font-semibold`}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/* Assignee Selection (Only editable on parent issue detail) */}
          {!isEditingSubtask && (
            <div className="flex flex-col gap-1.5">
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
                      setTaskData(prev => ({ ...prev, assignee: userMember._id }));
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
          )}

          <div>
            <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              <Calendar className="w-3.5 h-3.5 text-sky-500" /> Due Date
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
            <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              <Flag className="w-3.5 h-3.5 text-sky-500" /> Story Points
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

          {/* Creation Timestamp info */}
          <div className="border-t border-sky-100/50 pt-4 mt-6 space-y-2 text-xs text-gray-400 font-medium">
            {parentTaskData.createdAt && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-300" />
                <span>Created {new Date(parentTaskData.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Left and Right columns end */}
    </div>
  );
};

export default TaskDetailPage;
