import React from "react";
import { CheckCircle, AlignLeft, Flag, User, Calendar, Clock } from "lucide-react";
import { TaskMetaSidebarProps } from "../../../types";
import { getPriorityStyle } from "../../../utils";
import { IssueLinkingSection } from "./IssueLinkingSection";

export const TaskMetaSidebar: React.FC<TaskMetaSidebarProps> = ({
  taskData,
  setTaskData,
  statuses,
  members,
  isEditingSubtask,
  today,
  baseControlClasses,
  handleChange,
  linkType,
  setLinkType,
  targetTaskId,
  setTargetTaskId,
  workspaceTasks,
  linking,
  links,
  onAddLink,
  onRemoveLink,
  createdAt,
}) => {
  return (
    <div className="lg:col-span-4 space-y-4 bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm self-start">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-sky-100/50 dark:border-gray-800 pb-2">
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
                  setTaskData((prev: any) => ({ ...prev, assignee: userMember._id }));
                }
              }}
              className="text-[10px] text-sky-600 hover:text-sky-700 hover:underline font-bold transition-all cursor-pointer shrink-0"
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

      {/* Issue Linking Section (Only parent task) */}
      {!isEditingSubtask && (
        <IssueLinkingSection
          linkType={linkType}
          setLinkType={setLinkType}
          targetTaskId={targetTaskId}
          setTargetTaskId={setTargetTaskId}
          workspaceTasks={workspaceTasks}
          linking={linking}
          links={links}
          onAddLink={onAddLink}
          onRemoveLink={onRemoveLink}
          baseControlClasses={baseControlClasses}
        />
      )}

      {/* Creation Timestamp info */}
      <div className="border-t border-sky-100/50 dark:border-gray-800 pt-4 mt-6 space-y-2 text-xs text-gray-450 font-medium">
        {createdAt && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-300" />
            <span>Created {new Date(createdAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};
