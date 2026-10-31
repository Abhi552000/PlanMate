import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MessageSquare, Activity } from "lucide-react";
import { WRAPPER } from "../../assets/dummy";
import { ROUTES } from "../../constants/routeConstant";

// Sub-components
import { TaskDetailsHeader } from "./components/TaskDetailsHeader";
import { TaskDescriptionSection } from "./components/TaskDescriptionSection";
import { SubtaskListSection } from "./components/SubtaskListSection";
import { IssueLinkingSection } from "./components/IssueLinkingSection";
import { ActivityTimelineSection } from "./components/ActivityTimelineSection";
import { CommentsSection } from "./components/CommentsSection";
import { TaskMetaSidebar } from "./components/TaskMetaSidebar";
import { useTaskDetail } from "./hooks/useTaskDetail";

const baseControlClasses =
  "w-full px-3 py-2 border border-sky-100 dark:border-gray-800 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200";

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const subtaskIndexParam = searchParams.get("subtask");
  const subtaskIndex = subtaskIndexParam !== null ? parseInt(subtaskIndexParam, 10) : null;
  const [activeBottomTab, setActiveBottomTab] = useState<"comments" | "timeline">("comments");

  const {
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
    handleAddComment,
    handleDeleteComment,
    handleAddLink,
    handleRemoveLink,
    handleChange,
    handleSave,
    handleAddSubtask,
    handleInlineTitleUpdate,
  } = useTaskDetail(id, subtaskIndex);

  const today = new Date().toISOString().split("T")[0];
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

  if (loading) {
    return (
      <div className={`${WRAPPER} animate-pulse`}>
        {/* Header Breadcrumbs & Title Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="space-y-2">
            <div className="h-4 w-40 bg-slate-200 dark:bg-gray-800 rounded" />
            <div className="h-7 w-72 bg-slate-200 dark:bg-gray-800 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 bg-slate-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-9 w-24 bg-slate-200 dark:bg-gray-800 rounded-lg" />
          </div>
        </div>

        {/* 2-Column Detail Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-5">
          <div className="lg:col-span-8 space-y-6 bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-xs">
            {/* Description Skeleton */}
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-slate-200 dark:bg-gray-700 rounded" />
              <div className="h-32 w-full bg-slate-100 dark:bg-gray-800 rounded-xl" />
            </div>
            {/* Subtasks Skeleton */}
            <div className="space-y-2 pt-2">
              <div className="h-3.5 w-32 bg-slate-200 dark:bg-gray-700 rounded" />
              <div className="h-10 w-full bg-slate-100 dark:bg-gray-800 rounded-lg" />
              <div className="h-10 w-full bg-slate-100 dark:bg-gray-800 rounded-lg" />
            </div>
          </div>

          {/* Right Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-4 bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-xs">
            <div className="h-3.5 w-20 bg-slate-200 dark:bg-gray-700 rounded mb-3" />
            <div className="space-y-3">
              <div className="h-[38px] bg-slate-100 dark:bg-gray-800 rounded-lg" />
              <div className="h-[38px] bg-slate-100 dark:bg-gray-800 rounded-lg" />
              <div className="h-[38px] bg-slate-100 dark:bg-gray-800 rounded-lg" />
              <div className="h-[38px] bg-slate-100 dark:bg-gray-800 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !parentTaskData) {
    return (
      <div className={WRAPPER}>
        <div className="text-sm text-red-650 bg-red-50 p-4 rounded-xl border border-red-100">
          {error || "Task not found"}
        </div>
      </div>
    );
  }

  const isEditingSubtask = subtaskIndex !== null;
  const projectName = currentUser?.organization?.name || "PlanMate";
  const issueKey = parentTaskData.key || (parentTaskData._id ? `PM-${parentTaskData._id.slice(-4).toUpperCase()}` : "PM-1");

  return (
    <div className={WRAPPER}>
      <TaskDetailsHeader
        isEditingSubtask={isEditingSubtask}
        projectKey={projectName}
        issueKey={issueKey}
        issueType={taskData.issueType || "Task"}
        title={taskData.title}
        onTitleChange={handleInlineTitleUpdate}
        subtaskIndex={subtaskIndex}
        onBackToParent={() => setSearchParams({})}
        onBackToBoard={() => navigate(ROUTES.DASHBOARD)}
        onSave={handleSave}
        saving={saving}
        onAddSubtaskClick={() => {
          const el = document.getElementById("new-subtask-input");
          el?.focus();
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
        onLinkIssueClick={() => {
          const el = document.getElementById("issue-linking-section");
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-5">
        <div className="lg:col-span-8 space-y-6 bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-xs">
          <TaskDescriptionSection
            title={taskData.title}
            description={taskData.description}
            onChange={handleChange}
            baseControlClasses={baseControlClasses}
            members={members}
          />

          {!isEditingSubtask && (
            <SubtaskListSection
              subtasks={parentTaskData.subtasks || []}
              projectKey={issueKey}
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
            <IssueLinkingSection
              linkType={linkType}
              setLinkType={setLinkType}
              targetTaskId={targetTaskId}
              setTargetTaskId={setTargetTaskId}
              workspaceTasks={workspaceTasks}
              linking={linking}
              links={parentTaskData.links || []}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
              baseControlClasses={baseControlClasses}
              onNavigateToTask={(taskId) => navigate(`/task/${taskId}`)}
            />
          )}

          {!isEditingSubtask && (
            <div className="border-t border-sky-100/50 dark:border-gray-800 pt-5 mt-6">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveBottomTab("comments")}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition-all relative cursor-pointer ${
                    activeBottomTab === "comments"
                      ? "text-sky-600 dark:text-sky-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-sky-500"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Comments
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      activeBottomTab === "comments"
                        ? "bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {parentTaskData.comments?.length || 0}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveBottomTab("timeline")}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition-all relative cursor-pointer ${
                    activeBottomTab === "timeline"
                      ? "text-sky-600 dark:text-sky-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-sky-500"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  Activity Timeline
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      activeBottomTab === "timeline"
                        ? "bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {parentTaskData.history?.length || 0}
                  </span>
                </button>
              </div>

              {/* Tab Content */}
              {activeBottomTab === "comments" ? (
                <CommentsSection
                  comments={parentTaskData.comments || []}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  addingComment={addingComment}
                  deletingCommentId={deletingCommentId}
                  currentUser={currentUser}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  members={members}
                />
              ) : (
                <ActivityTimelineSection history={parentTaskData.history || []} />
              )}
            </div>
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
