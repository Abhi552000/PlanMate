import React, { useState } from "react";
import { CheckCircle, AlignLeft, Flag, User, UserCheck, Calendar, Clock, Tag, X, Plus } from "lucide-react";
import { TaskMetaSidebarProps } from "../../../types";
import { getPriorityStyle } from "../../../utils";
import { selectControlClasses } from "../../../assets/dummy";


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
  const [labelInput, setLabelInput] = useState("");
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
          className={selectControlClasses}
        >
          {statuses.map(s => (
            <option key={s} value={s} className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 py-1.5">{s}</option>
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
          className={`${selectControlClasses} disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          <option value="Task" className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 py-1.5">Task</option>
          <option value="Story" className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 py-1.5">Story</option>
          <option value="Bug" className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 py-1.5">Bug</option>
          <option value="Epic" className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 py-1.5">Epic</option>
          {isEditingSubtask && <option value="Sub-task" className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 py-1.5">Sub-task</option>}
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
          className={`${selectControlClasses} ${
            getPriorityStyle(taskData.priority)
          }`}
        >
          <option value="Low" className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 py-1.5">Low</option>
          <option value="Medium" className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 py-1.5">Medium</option>
          <option value="High" className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 py-1.5">High</option>
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
              className={selectControlClasses}
            >
              <option value="" className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 py-1.5">Unassigned</option>
              {members.map(member => (
                <option key={member._id} value={member._id} className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 py-1.5">
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Reporter Selection */}
      {!isEditingSubtask && (
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            <UserCheck className="w-3.5 h-3.5 text-sky-500" /> Reporter
          </label>
          <select
            name="reporter"
            value={taskData.reporter || ""}
            onChange={handleChange}
            className={selectControlClasses}
          >
            <option value="" className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 py-1.5">Select Reporter</option>
            {members.map(member => (
              <option key={member._id} value={member._id} className="bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 py-1.5">
                {member.name}
              </option>
            ))}
          </select>
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

      {/* Estimation: Story Points & Time Estimate */}
      <div className="grid grid-cols-2 gap-2.5">
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

        <div>
          <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1" title="Original Time Estimate in hours">
            <Clock className="w-3.5 h-3.5 text-sky-500" /> Estimate (h)
          </label>
          <input
            type="number"
            name="originalEstimate"
            min="0"
            max="1000"
            step="0.5"
            placeholder="0"
            value={taskData.originalEstimate !== undefined ? taskData.originalEstimate : 0}
            onChange={handleChange}
            className={baseControlClasses}
          />
        </div>
      </div>

      {/* Labels Section */}
      <div>
        <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
          <Tag className="w-3.5 h-3.5 text-sky-500" /> Labels
        </label>

        {/* Existing Labels */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2 min-h-[22px]">
          {(taskData.labels || []).map((label: string, idx: number) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-850"
            >
              {label}
              <button
                type="button"
                onClick={() => {
                  setTaskData((prev: any) => ({
                    ...prev,
                    labels: (prev.labels || []).filter((_: any, i: number) => i !== idx),
                  }));
                }}
                className="hover:text-red-500 transition-colors cursor-pointer"
                title={`Remove ${label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {(!taskData.labels || taskData.labels.length === 0) && (
            <span className="text-[11px] text-gray-400 italic">None</span>
          )}
        </div>

        {/* Add Label Input */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Add label and press Enter..."
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                const trimmed = labelInput.trim().toLowerCase();
                if (trimmed && !(taskData.labels || []).includes(trimmed)) {
                  setTaskData((prev: any) => ({
                    ...prev,
                    labels: [...(prev.labels || []), trimmed],
                  }));
                  setLabelInput("");
                }
              }
            }}
            className={`${baseControlClasses} py-1.5 text-xs`}
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = labelInput.trim().toLowerCase();
              if (trimmed && !(taskData.labels || []).includes(trimmed)) {
                setTaskData((prev: any) => ({
                  ...prev,
                  labels: [...(prev.labels || []), trimmed],
                }));
                setLabelInput("");
              }
            }}
            className="p-1.5 rounded-lg border border-sky-100 dark:border-gray-800 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-gray-800 cursor-pointer shrink-0"
            title="Add Label"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>



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
