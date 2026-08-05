import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ITask, IUser } from "../../types";
import { taskService } from "../../services/taskService";
import { orgService } from "../../services/orgService";
import { toast } from "react-toastify";
import { WRAPPER } from "../../assets/dummy";
import { ROUTES } from "../../constants/routeConstant";

// Sub-components
import { TaskDetailsHeader } from "./components/TaskDetailsHeader";
import { TaskDescriptionSection } from "./components/TaskDescriptionSection";
import { SubtaskListSection } from "./components/SubtaskListSection";
import { ActivityTimelineSection } from "./components/ActivityTimelineSection";
import { CommentsSection } from "./components/CommentsSection";
import { TaskMetaSidebar } from "./components/TaskMetaSidebar";

const baseControlClasses =
  "w-full px-3 py-2 border border-sky-100 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300";

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const subtaskIndexParam = searchParams.get("subtask");
  const subtaskIndex = subtaskIndexParam !== null ? parseInt(subtaskIndexParam, 10) : null;

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
  
  const today = new Date().toISOString().split("T")[0];

  // Comment and linking states
  const [commentText, setCommentText] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const [workspaceTasks, setWorkspaceTasks] = useState<ITask[]>([]);
  const [linkType, setLinkType] = useState<"blocks" | "blocked by" | "relates to">("relates to");
  const [targetTaskId, setTargetTaskId] = useState("");
  const [linking, setLinking] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  useEffect(() => {
    if (subtaskIndex !== null) return;
    const fetchOrgTasks = async () => {
      try {
        const data = await taskService.getTasks();
        if (data?.success && data?.tasks) {
          setWorkspaceTasks(data.tasks.filter((t: any) => t._id !== id));
        }
      } catch (err) {
        console.error("Error fetching tasks for linking:", err);
      }
    };
    fetchOrgTasks();
  }, [id, subtaskIndex]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      const data = await taskService.addComment(id!, commentText.trim());
      if (data?.success && data?.task) {
        setParentTaskData(data.task);
        setCommentText("");
        toast.success("Comment added successfully!");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add comment");
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
        toast.success("Comment deleted successfully!");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete comment");
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
        toast.warn("This task is already linked with the selected relation.");
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
        toast.success("Issue dependency link added!");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add link");
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
        toast.success("Link removed successfully!");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove link");
    }
  };

  // Fetch parent task data
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

  // Sync active task fields (depends on parent task data and subtaskIndex)
  useEffect(() => {
    if (!parentTaskData) return;

    if (subtaskIndex !== null && parentTaskData.subtasks?.[subtaskIndex]) {
      const sub = parentTaskData.subtasks[subtaskIndex];
      setTaskData({
        title: sub.title || "",
        description: sub.description || "",
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
        description: parentTaskData.description || "",
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
        console.error("Error fetching workspace details:", err);
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
      toast.error("Title summary is required.");
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
          description: taskData.description,
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
          description: taskData.description,
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
        toast.success("Task updated successfully!");
        if (subtaskIndex !== null) {
          setSearchParams({});
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update task.");
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
    toast.success("Subtask draft added. Remember to click Save Changes!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-500" />
        <span className="text-sm font-semibold text-gray-500 mt-4">Loading ticket details...</span>
      </div>
    );
  }

  if (error || !parentTaskData) {
    return (
      <div className={WRAPPER}>
        <div className="text-sm text-red-650 bg-red-50 p-4 rounded-xl border border-red-100">{error || "Task not found"}</div>
      </div>
    );
  }

  const isEditingSubtask = subtaskIndex !== null;
  const projectKey = parentTaskData.key || "PM";

  return (
    <div className={WRAPPER}>
      <TaskDetailsHeader
        isEditingSubtask={isEditingSubtask}
        projectKey={projectKey}
        subtaskIndex={subtaskIndex}
        onBackToParent={() => setSearchParams({})}
        onBackToBoard={() => navigate(ROUTES.DASHBOARD)}
        onSave={handleSave}
        saving={saving}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
        <div className="lg:col-span-8 space-y-5 bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm">
          <TaskDescriptionSection
            title={taskData.title}
            description={taskData.description}
            onChange={handleChange}
            baseControlClasses={baseControlClasses}
          />

          {!isEditingSubtask && (
            <SubtaskListSection
              subtasks={parentTaskData.subtasks || []}
              projectKey={projectKey}
              newSubtaskTitle={newSubtaskTitle}
              setNewSubtaskTitle={setNewSubtaskTitle}
              editingSubtaskIdx={editingSubtaskIdx}
              setEditingSubtaskIdx={setEditingSubtaskIdx}
              editingSubtaskVal={editingSubtaskVal}
              setEditingSubtaskVal={setEditingSubtaskVal}
              statuses={statuses}
              setParentTaskData={setParentTaskData}
              onOpenSubtask={(idx) => setSearchParams({ subtask: String(idx) })}
              handleAddSubtask={handleAddSubtask}
            />
          )}

          {!isEditingSubtask && (
            <ActivityTimelineSection history={parentTaskData.history || []} />
          )}

          {!isEditingSubtask && (
            <CommentsSection
              comments={parentTaskData.comments || []}
              commentText={commentText}
              setCommentText={setCommentText}
              addingComment={addingComment}
              deletingCommentId={deletingCommentId}
              currentUser={currentUser}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
            />
          )}
        </div>

        <TaskMetaSidebar
          taskData={taskData}
          setTaskData={setTaskData}
          statuses={statuses}
          members={members}
          isEditingSubtask={isEditingSubtask}
          today={today}
          baseControlClasses={baseControlClasses}
          handleChange={handleChange}
          linkType={linkType}
          setLinkType={setLinkType}
          targetTaskId={targetTaskId}
          setTargetTaskId={setTargetTaskId}
          workspaceTasks={workspaceTasks}
          linking={linking}
          links={parentTaskData.links || []}
          onAddLink={handleAddLink}
          onRemoveLink={handleRemoveLink}
          createdAt={parentTaskData.createdAt}
        />
      </div>
    </div>
  );
};

export default TaskDetailPage;
