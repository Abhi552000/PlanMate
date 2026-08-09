import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { taskService } from "../../../services/taskService";
import { orgService } from "../../../services/orgService";
import { ITask, IUser } from "../../../types";
import { TOAST_MESSAGES, CONSOLE_ERRORS } from "../../../constants/messages";
import { cleanMentionsForEditing, formatMentionsForSaving } from "../../../utils/mentions";

export const useTaskDetail = (id: string | undefined, subtaskIndex: number | null) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [parentTaskData, setParentTaskData] = useState<ITask | null>(null);
  const [members, setMembers] = useState<IUser[]>([]);
  const [taskData, setTaskData] = useState<any>({
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
  const [editingSubtaskIdx, setEditingSubtaskIdx] = useState<number | null>(null);
  const [editingSubtaskVal, setEditingSubtaskVal] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<string[]>(["To Do", "In Progress", "Done"]);

  const [commentText, setCommentText] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const [workspaceTasks, setWorkspaceTasks] = useState<ITask[]>([]);
  const [linkType, setLinkType] = useState<"blocks" | "blocked by" | "relates to">("relates to");
  const [targetTaskId, setTargetTaskId] = useState("");
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    if (subtaskIndex !== null) return;
    const fetchOrgTasks = async () => {
      try {
        const data = await taskService.getTasks();
        if (data?.success && data?.tasks) {
          setWorkspaceTasks(data.tasks.filter((t: any) => t._id !== id));
        }
      } catch (err) {
        console.error(CONSOLE_ERRORS.FETCH_TASKS_LINKING, err);
      }
    };
    fetchOrgTasks();
  }, [id, subtaskIndex]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      const formattedComment = formatMentionsForSaving(commentText.trim(), members);
      const data = await taskService.addComment(id!, formattedComment);
      if (data?.success && data?.task) {
        setParentTaskData(data.task);
        setCommentText("");
        toast.success(TOAST_MESSAGES.COMMENT_ADD_SUCCESS);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.COMMENT_ADD_ERROR);
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);
    try {
      const data = await taskService.deleteComment(id!, commentId);
      if (data?.success && data?.task) {
        setParentTaskData(data.task);
        toast.success(TOAST_MESSAGES.COMMENT_DEL_SUCCESS);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.COMMENT_DEL_ERROR);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTaskId) return;
    setLinking(true);
    try {
      const currentLinks = parentTaskData?.links || [];
      if (currentLinks.some((l: any) => l.targetTask?._id === targetTaskId && l.linkType === linkType)) {
        toast.warn(TOAST_MESSAGES.LINK_EXISTS_WARN);
        setLinking(false);
        return;
      }
      const updatedLinks = [...currentLinks, { linkType, targetTask: targetTaskId }];
      const data = await taskService.updateTask(id!, {
        ...parentTaskData,
        links: updatedLinks
      });
      if (data?.task) {
        setParentTaskData(data.task);
        setTargetTaskId("");
        toast.success(TOAST_MESSAGES.LINK_ADD_SUCCESS);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.LINK_ADD_ERROR);
    } finally {
      setLinking(false);
    }
  };

  const handleRemoveLink = async (linkId: string) => {
    try {
      const currentLinks = parentTaskData?.links || [];
      const updatedLinks = currentLinks.filter((l: any) => l._id !== linkId);
      const data = await taskService.updateTask(id!, {
        ...parentTaskData,
        links: updatedLinks
      });
      if (data?.task) {
        setParentTaskData(data.task);
        toast.success(TOAST_MESSAGES.LINK_REMOVE_SUCCESS);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.LINK_REMOVE_ERROR);
    }
  };

  const fetchTask = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTaskById(id!);
      if (data?.success && data?.task) {
        setParentTaskData(data.task);
      } else {
        throw new Error("Task not found");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Failed to load task details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  useEffect(() => {
    if (!parentTaskData) return;

    if (subtaskIndex !== null && parentTaskData.subtasks?.[subtaskIndex]) {
      const sub = parentTaskData.subtasks[subtaskIndex];
      setTaskData({
        title: sub.title || "",
        description: cleanMentionsForEditing(sub.description || ""),
        priority: sub.priority || "Low",
        dueDate: sub.dueDate ? new Date(sub.dueDate).toISOString().split("T")[0] : "",
        assignee: "",
        status: sub.status || "To Do",
        storyPoints: sub.storyPoints !== undefined ? sub.storyPoints : 0,
        issueType: sub.issueType || "Sub-task"
      });
    } else {
      setTaskData({
        title: parentTaskData.title || "",
        description: cleanMentionsForEditing(parentTaskData.description || ""),
        priority: parentTaskData.priority || "Low",
        dueDate: parentTaskData.dueDate ? new Date(parentTaskData.dueDate).toISOString().split("T")[0] : "",
        assignee: parentTaskData.assignee?._id || parentTaskData.assignee || "",
        status: parentTaskData.status || "To Do",
        storyPoints: parentTaskData.storyPoints !== undefined ? parentTaskData.storyPoints : 1,
        issueType: parentTaskData.issueType || "Task"
      });
    }
  }, [parentTaskData, subtaskIndex]);

  useEffect(() => {
    const fetchOrgMembersAndStatuses = async () => {
      try {
        const membersData = await orgService.getOrgMembers();
        if (membersData?.success && membersData?.members) {
          setMembers(membersData.members);
        }
        const orgData = await orgService.getOrgDetails();
        if (orgData?.success && orgData?.organization?.statuses) {
          setStatuses(orgData.organization.statuses);
        }
      } catch (err) {
        console.error(CONSOLE_ERRORS.FETCH_WORKSPACE_DETAILS, err);
      }
    };
    fetchOrgMembersAndStatuses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!taskData.title.trim()) {
      toast.error(TOAST_MESSAGES.TITLE_REQUIRED_ERROR);
      return;
    }
    setSaving(true);
    try {
      let dataToUpdate: any = {};
      if (subtaskIndex !== null && parentTaskData) {
        const updatedSubtasks = [...(parentTaskData.subtasks || [])];
        updatedSubtasks[subtaskIndex] = {
          ...updatedSubtasks[subtaskIndex],
          title: taskData.title.trim(),
          description: formatMentionsForSaving(taskData.description, members),
          priority: taskData.priority,
          dueDate: taskData.dueDate || undefined,
          status: taskData.status,
          completed: taskData.status.toLowerCase() === "done",
          storyPoints: Number(taskData.storyPoints)
        };
        dataToUpdate = { subtasks: updatedSubtasks };
      } else {
        dataToUpdate = {
          title: taskData.title.trim(),
          description: formatMentionsForSaving(taskData.description, members),
          priority: taskData.priority,
          dueDate: taskData.dueDate || undefined,
          assignee: taskData.assignee || null,
          status: taskData.status,
          storyPoints: Number(taskData.storyPoints),
          issueType: taskData.issueType
        };
      }

      const res = await taskService.updateTask(id!, dataToUpdate);
      if (res?.success && res?.task) {
        setParentTaskData(res.task);
        toast.success(TOAST_MESSAGES.TASK_UPDATE_SUCCESS);
        if (subtaskIndex !== null) {
          setSearchParams({});
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.TASK_UPDATE_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim() || !parentTaskData) return;
    const newSub: any = {
      title: newSubtaskTitle.trim(),
      completed: false,
      status: "To Do",
      description: "",
      priority: "Low",
      storyPoints: 0,
      issueType: "Sub-task"
    };
    const updated = [...(parentTaskData.subtasks || []), newSub];
    setParentTaskData((prev) => prev ? { ...prev, subtasks: updated } : null);
    setNewSubtaskTitle("");
    toast.success(TOAST_MESSAGES.SUBTASK_DRAFT_SUCCESS);
  };

  return {
    parentTaskData,
    setParentTaskData,
    members,
    taskData,
    setTaskData,
    newSubtaskTitle,
    setNewSubtaskTitle,
    editingSubtaskIdx,
    setEditingSubtaskIdx,
    editingSubtaskVal,
    setEditingSubtaskVal,
    loading,
    saving,
    error,
    statuses,
    commentText,
    setCommentText,
    addingComment,
    deletingCommentId,
    workspaceTasks,
    linkType,
    setLinkType,
    targetTaskId,
    setTargetTaskId,
    linking,
    searchParams,
    setSearchParams,
    handleAddComment,
    handleDeleteComment,
    handleAddLink,
    handleRemoveLink,
    handleChange,
    handleSave,
    handleAddSubtask,
  };
};
