import React, { useCallback, useEffect, useState } from "react";
import { baseControlClasses, DEFAULT_TASK } from "../assets/dummy";
import { taskService } from "../services/taskService";
import { orgService } from "../services/orgService";
import { backlogService } from "../services/backlogService";
import { toast } from "react-toastify";
import { IUser, ISubtask, TaskModalProps } from "../types";
import { CONSOLE_ERRORS } from "../constants/messages";
import { getNormalizedTaskData } from "../utils";
import { cleanMentionsForEditing, formatMentionsForSaving } from "../utils/mentions";

// Sub-components
import { TaskFormGeneral } from "./task-modal/TaskFormGeneral";
import { TaskFormMeta } from "./task-modal/TaskFormMeta";
import { TaskFormSubtasks } from "./task-modal/TaskFormSubtasks";
import { TaskModalHeader } from "./task-modal/TaskModalHeader";
import { TaskModalFooter } from "./task-modal/TaskModalFooter";

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  onSave,
  onLogout,
  statuses = ["To Do", "In Progress", "Done", "Closed"],
}) => {
  const [taskData, setTaskData] = useState<any>({
    ...DEFAULT_TASK,
    subtasks: [] as ISubtask[],
    status: "To Do",
    issueType: "Task",
    storyPoints: 1,
    assignee: "",
    key: "",
  });
  const [members, setMembers] = useState<IUser[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [epics, setEpics] = useState<any[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskIdx, setEditingSubtaskIdx] = useState<number | null>(
    null
  );
  const [editingSubtaskVal, setEditingSubtaskVal] = useState("");
  const [parentTask, setParentTask] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const fetchMembersAndAgile = useCallback(async () => {
    try {
      const memberData = await orgService.getOrgMembers();
      if (memberData?.success && memberData?.members) {
        setMembers(memberData.members);
      }
      const sprintData = await backlogService.getSprints();
      if (sprintData?.success && sprintData?.sprints) {
        setSprints(sprintData.sprints);
      }
      const epicData = await backlogService.getEpics();
      if (epicData?.success && epicData?.epics) {
        setEpics(epicData.epics);
      }
    } catch (err) {
      console.error(CONSOLE_ERRORS.FETCH_DEPENDENCIES_MODAL, err);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchMembersAndAgile();
  }, [isOpen, fetchMembersAndAgile]);

  useEffect(() => {
    if (!isOpen) return;
    setParentTask(null);
    const normalized = getNormalizedTaskData(taskToEdit, DEFAULT_TASK);
    normalized.description = cleanMentionsForEditing(normalized.description || "");
    setTaskData(normalized);
    setNewSubtaskTitle("");
  }, [isOpen, taskToEdit]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub = {
      title: newSubtaskTitle.trim(),
      completed: false,
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
      dueDate:
        typeof subtask.dueDate === "string"
          ? subtask.dueDate.split("T")[0]
          : "",
      completed: subtask.completed ? "Yes" : "No",
      status: subtask.status || "To Do",
      issueType: "Sub-task",
      storyPoints: subtask.storyPoints !== undefined ? subtask.storyPoints : 0,
      subtasks: [],
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
        storyPoints: taskData.storyPoints,
      };
    }
    setTaskData({ ...parentTask, subtasks: updatedSubtasks });
    setParentTask(null);
  };

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setTaskData((prev: any) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      let finalTaskData = {
        ...taskData,
        description: formatMentionsForSaving(taskData.description || "", members),
      };
      if (parentTask) {
        const updatedSubtasks = [...parentTask.subtasks];
        const subtaskIdx = parentTask.editingSubtaskIndex;
        if (subtaskIdx !== undefined && updatedSubtasks[subtaskIdx]) {
          updatedSubtasks[subtaskIdx] = {
            ...updatedSubtasks[subtaskIdx],
            title: taskData.title,
            description: formatMentionsForSaving(taskData.description || "", members),
            priority: taskData.priority,
            dueDate: taskData.dueDate,
            completed: taskData.status === "Done",
            status: taskData.status,
            storyPoints: taskData.storyPoints,
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

        toast.success(
          isEdit ? "Task updated successfully!" : "Task created successfully!"
        );
        onSave?.(saved);
        onClose();
        setParentTask(null);
      } catch (err: any) {
        if (err?.status === 401) return onLogout?.();
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "An unexpected error occurred";
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
      className="fixed inset-0 backdrop-blur-sm bg-black/40 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800/90 border border-sky-100 dark:border-gray-700 rounded-2xl max-w-2xl sm:max-w-3xl lg:max-w-4xl w-full shadow-2xl relative p-4 sm:p-6 md:p-8 animate-fadeIn max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <TaskModalHeader
          parentTask={parentTask}
          taskData={taskData}
          handleBackToParent={handleBackToParent}
          onClose={onClose}
          setParentTask={setParentTask}
        />
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 space-y-5 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2 min-h-0 py-2 scrollbar-thin">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              {/* Left side: Main text fields and subtasks */}
              <div className="md:col-span-7 space-y-4">
                <TaskFormGeneral
                  title={taskData.title}
                  description={taskData.description}
                  onChange={handleChange}
                  baseControlClasses={baseControlClasses}
                  members={members}
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
                sprints={sprints}
                epics={epics}
                parentTask={parentTask}
                today={today}
                baseControlClasses={baseControlClasses}
                handleChange={handleChange}
              />
            </div>
          </div>

          <div className="shrink-0 pt-2 border-t border-sky-50 dark:border-gray-700">
            <TaskModalFooter
              loading={loading}
              parentTask={parentTask}
              taskData={taskData}
              onClose={onClose}
              setParentTask={setParentTask}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
