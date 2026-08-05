import React, { useCallback, useEffect, useState } from "react";
import { baseControlClasses, DEFAULT_TASK } from "../assets/dummy";
import { PlusCircle, Save, X, BookOpen } from "lucide-react";
import { taskService } from "../services/taskService";
import { orgService } from "../services/orgService";
import { toast } from "react-toastify";
import { ITask, IUser, ISubtask } from "../types";

// Sub-components
import { TaskFormGeneral } from "./task-modal/TaskFormGeneral";
import { TaskFormMeta } from "./task-modal/TaskFormMeta";
import { TaskFormSubtasks } from "./task-modal/TaskFormSubtasks";

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
    const newSub = { 
      title: newSubtaskTitle.trim(), 
      completed: false 
    };
    setTaskData((prev: any) => ({
      ...prev,
      subtasks: [...(prev.subtasks || []), newSub],
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
            <h2 className=" text-2xl font-bold text-gray-800 dark:text-gray-255 flex items-center gap-2">
              {parentTask ? (
                <>
                  <BookOpen className=" text-sky-505 w-6 h-6" />
                  Sub-task Detail
                </>
              ) : taskData.id ? (
                <Save className=" text-sky-505 w-6 h-6" />
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
            className=" p-2 hover:bg-sky-50 rounded-lg transition-colors text-gray-400 hover:text-sky-700 cursor-pointer"
          >
            <X className=" w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className=" space-y-5">
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* Left side: Main text fields and subtasks */}
            <div className="md:col-span-7 space-y-4">
              <TaskFormGeneral
                title={taskData.title}
                description={taskData.description}
                onChange={handleChange}
                baseControlClasses={baseControlClasses}
              />

              {parentTask === null && (
                <TaskFormSubtasks
                  subtasks={taskData.subtasks || []}
                  setTaskData={setTaskData}
                  newSubtaskTitle={newSubtaskTitle}
                  setNewSubtaskTitle={setNewSubtaskTitle}
                  editingSubtaskIdx={editingSubtaskIdx}
                  setEditingSubtaskIdx={setEditingSubtaskIdx}
                  editingSubtaskVal={editingSubtaskVal}
                  setEditingSubtaskVal={setEditingSubtaskVal}
                  statuses={statuses}
                  onOpenSubtaskDetail={handleOpenSubtaskDetail}
                  onAddSubtask={handleAddSubtask}
                />
              )}
            </div>
            {/* Right side: Jira metadata layout */}
            <TaskFormMeta
              taskData={taskData}
              setTaskData={setTaskData}
              statuses={statuses}
              members={members}
              parentTask={parentTask}
              today={today}
              baseControlClasses={baseControlClasses}
              handleChange={handleChange}
            />
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
