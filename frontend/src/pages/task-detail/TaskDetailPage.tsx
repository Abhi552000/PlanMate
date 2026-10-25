import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MessageSquare, Activity } from "lucide-react";
import { WRAPPER } from "../../assets/dummy";
import { ROUTES } from "../../constants/routeConstant";

// Sub-components
import { TaskDetailsHeader } from "./components/TaskDetailsHeader";
import { TaskDescriptionSection } from "./components/TaskDescriptionSection";
import { SubtaskListSection } from "./components/SubtaskListSection";
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
  } = useTaskDetail(id, subtaskIndex);

  const today = new Date().toISOString().split("T")[0];
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

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
            members={members}
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
