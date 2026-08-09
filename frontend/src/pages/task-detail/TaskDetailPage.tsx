import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
  "w-full px-3 py-2 border border-sky-100 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-505 focus:border-sky-505 transition-all duration-200 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300";

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const subtaskIndexParam = searchParams.get("subtask");
  const subtaskIndex = subtaskIndexParam !== null ? parseInt(subtaskIndexParam, 10) : null;

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
