import React from "react";
import { CheckCircle, AlignLeft, Flag, User, Calendar, Clock, Link as LinkIcon, X } from "lucide-react";
import { Button } from "../../../components/ui/Button";

interface TaskMetaSidebarProps {
  taskData: any;
  setTaskData: React.Dispatch<React.SetStateAction<any>>;
  statuses: string[];
  members: any[];
  isEditingSubtask: boolean;
  today: string;
  baseControlClasses: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  linkType: "blocks" | "blocked by" | "relates to";
  setLinkType: (val: "blocks" | "blocked by" | "relates to") => void;
  targetTaskId: string;
  setTargetTaskId: (val: string) => void;
  workspaceTasks: any[];
  linking: boolean;
  links: any[];
  onAddLink: (e: React.FormEvent) => void;
  onRemoveLink: (linkId: string) => void;
  createdAt?: string | Date;
}

const getPriorityStyle = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-red-600 bg-red-50 border-red-100";
    case "medium":
      return "text-amber-600 bg-amber-50 border-amber-100";
    default:
      return "text-green-600 bg-green-50 border-green-100";
  }
};

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
        <div className="border-t border-sky-100/50 dark:border-gray-800 pt-4 mt-4 space-y-3">
          <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            <LinkIcon className="w-3.5 h-3.5 text-sky-500" /> Issue Linking
          </label>

          {/* Add Link Form */}
          <form onSubmit={onAddLink} className="space-y-2">
            <div className="flex gap-1.5">
              <select
                value={linkType}
                onChange={(e: any) => setLinkType(e.target.value)}
                className={`${baseControlClasses} text-xs py-1.5 font-bold flex-1`}
              >
                <option value="relates to">relates to</option>
                <option value="blocks">blocks</option>
                <option value="blocked by">blocked by</option>
              </select>

              <select
                value={targetTaskId}
                onChange={(e) => setTargetTaskId(e.target.value)}
                className={`${baseControlClasses} text-xs py-1.5 font-bold flex-1`}
                required
              >
                <option value="">Select issue...</option>
                {workspaceTasks.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.key ? `[${t.key}] ${t.title}` : t.title}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" size="sm" className="w-full text-xs py-1.5" loading={linking}>
              Link Issue
            </Button>
          </form>

          {/* Linked Issues list */}
          <div className="space-y-2 pt-1">
            {links.map((link) => {
              const target = link.targetTask;
              if (!target) return null;
              const isTargetDone = target.completed === true || target.completed === "Yes" || target.status?.toLowerCase() === "done";
              
              return (
                <div key={link._id} className="flex items-center justify-between gap-2 p-2 bg-sky-50/20 dark:bg-sky-950/10 rounded-xl border border-sky-100/30 dark:border-gray-800 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 capitalize">
                        {link.linkType}
                      </span>
                      <span className="font-semibold text-gray-500 text-[10px]">
                        {target.key || "PM"}
                      </span>
                    </div>
                    <p className={`truncate text-gray-700 dark:text-gray-300 font-bold mt-0.5 ${isTargetDone ? "line-through text-gray-405" : ""}`} title={target.title}>
                      {target.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                      isTargetDone ? "text-green-600 bg-green-50/50 border-green-200" : "text-sky-600 bg-sky-50/50 border-sky-200"
                    }`}>
                      {target.status || "To Do"}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveLink(link._id!)}
                      className="text-gray-400 hover:text-red-505 transition-colors p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
