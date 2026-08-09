import React, { useState } from "react";
import {
  CheckCircle,
  AlignLeft,
  Flag,
  User,
  Calendar,
  Layers,
  Clock,
  Plus,
  History,
} from "lucide-react";
import { priorityStyles } from "../../assets/dummy";
import { TaskFormMetaProps } from "../../types";
import { taskService } from "../../services/taskService";
import { toast } from "react-toastify";
import { TOAST_MESSAGES } from "../../constants/messages";

export const TaskFormMeta: React.FC<TaskFormMetaProps> = ({
  taskData,
  setTaskData,
  statuses,
  members,
  sprints = [],
  epics = [],
  parentTask,
  today,
  baseControlClasses,
  handleChange,
}) => {
  // Log work local states
  const [showLogForm, setShowLogForm] = useState(false);
  const [logHours, setLogHours] = useState("");
  const [logDesc, setLogDesc] = useState("");
  const [logging, setLogging] = useState(false);

  const estimate = taskData.originalEstimate || 0;
  const logged = taskData.timeLogged || 0;
  const loggedPercent =
    estimate > 0 ? Math.min(100, Math.round((logged / estimate) * 100)) : 0;

  const handleLogWork = async (e: React.FormEvent) => {
    e.preventDefault();
    const hours = Number(logHours);
    if (isNaN(hours) || hours <= 0) {
      toast.error(TOAST_MESSAGES.WORKLOG_HOURS_INVALID);
      return;
    }

    setLogging(true);
    try {
      const res = await taskService.logWork(
        taskData.id || taskData._id,
        hours,
        logDesc
      );
      if (res.success && res.task) {
        toast.success(TOAST_MESSAGES.WORKLOG_ADD_SUCCESS);
        setTaskData(res.task);
        setLogHours("");
        setLogDesc("");
        setShowLogForm(false);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        TOAST_MESSAGES.WORKLOG_ADD_ERROR;
      toast.error(msg);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="md:col-span-5 mt-4 md:mt-0 space-y-4 bg-sky-50/20 dark:bg-gray-900/50 p-4 rounded-xl border border-sky-100/50 dark:border-gray-800 self-start">
      <div>
        <label className=" flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
          <CheckCircle className=" w-3.5 h-3.5 text-sky-500" /> Status
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
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className=" flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
          <AlignLeft className=" w-3.5 h-3.5 text-sky-500" /> Issue Type
        </label>
        <select
          name="issueType"
          value={taskData.issueType || (parentTask ? "Sub-task" : "Task")}
          onChange={handleChange}
          disabled={parentTask !== null}
          className={`${baseControlClasses} font-semibold disabled:bg-gray-55 disabled:text-gray-400`}
        >
          <option value="Task">Task</option>
          <option value="Story">Story</option>
          <option value="Bug">Bug</option>
          <option value="Epic">Epic</option>
          {parentTask !== null && <option value="Sub-task">Sub-task</option>}
        </select>
      </div>

      <div>
        <label className=" flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
          <Flag className=" w-3.5 h-3.5 text-sky-500" /> Priority
        </label>
        <select
          name="priority"
          value={taskData.priority}
          onChange={handleChange}
          className={`${baseControlClasses} ${
            priorityStyles[taskData.priority] || ""
          } font-semibold`}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>

      {/* Assignee selection */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
          <User className="w-3.5 h-3.5 text-sky-500" /> Assignee
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const cur = JSON.parse(
                localStorage.getItem("currentUser") || "{}"
              );
              const userMember = members.find((m) => m.email === cur.email);
              if (userMember) {
                setTaskData((prev: any) => ({
                  ...prev,
                  assignee: userMember._id,
                }));
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
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className=" flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
          <Calendar className=" w-3.5 h-3.5 text-sky-500" /> Due Date
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

      {parentTask === null && (
        <>
          <div>
            <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              <Layers className="w-3.5 h-3.5 text-sky-500" /> Epic Link
            </label>
            <select
              name="epic"
              value={taskData.epic || ""}
              onChange={handleChange}
              className={`${baseControlClasses} font-semibold`}
            >
              <option value="">No Epic</option>
              {epics.map((epic: any) => (
                <option key={epic._id} value={epic._id}>
                  {epic.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              <Calendar className="w-3.5 h-3.5 text-sky-500" /> Sprint
            </label>
            <select
              name="sprint"
              value={taskData.sprint || ""}
              onChange={handleChange}
              className={`${baseControlClasses} font-semibold`}
            >
              <option value="">Backlog</option>
              {sprints.map((sprint: any) => (
                <option key={sprint._id} value={sprint._id}>
                  {sprint.name} ({sprint.status})
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className=" flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            Story Points
          </label>
          <input
            type="number"
            name="storyPoints"
            min="0"
            max="100"
            value={
              taskData.storyPoints !== undefined ? taskData.storyPoints : 1
            }
            onChange={handleChange}
            className={baseControlClasses}
            required
          />
        </div>

        <div>
          <label className=" flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            Estimate (h)
          </label>
          <input
            type="number"
            name="originalEstimate"
            min="0"
            value={
              taskData.originalEstimate !== undefined
                ? taskData.originalEstimate
                : 0
            }
            onChange={handleChange}
            className={baseControlClasses}
            required
          />
        </div>
      </div>

      {/* Jira Style Time Tracking Component */}
      {(taskData.id || taskData._id) && (
        <div className="border-t border-sky-100 dark:border-gray-800 pt-4 mt-2 space-y-3">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Clock className="w-3.5 h-3.5 text-sky-500" /> Time Tracking
            </span>
            <button
              type="button"
              onClick={() => setShowLogForm(!showLogForm)}
              className="text-[10px] bg-sky-50 hover:bg-sky-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-sky-600 dark:text-sky-400 px-2 py-1 rounded font-bold flex items-center gap-0.5 transition"
            >
              <Plus className="w-3 h-3" /> Log Work
            </button>
          </div>

          {/* Estimates vs Logged values */}
          <div className="text-xs flex justify-between text-gray-600 dark:text-gray-400">
            <span>{logged}h logged</span>
            <span>
              {estimate > 0 ? `${estimate}h estimate` : "No estimate"}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${loggedPercent}%` }}
            />
          </div>
          {estimate > 0 && (
            <div className="text-[10px] text-right text-gray-500 dark:text-gray-400">
              {loggedPercent}% logged
            </div>
          )}

          {/* Log Work Form */}
          {showLogForm && (
            <div className="bg-sky-50/50 dark:bg-gray-800 p-3 rounded-lg border border-sky-100 dark:border-gray-700 space-y-2 animate-fadeIn">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  placeholder="Hours (e.g. 1.5)"
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                  className="col-span-1 px-2 py-1 border border-sky-100 dark:border-gray-600 bg-white dark:bg-gray-900 rounded text-xs focus:ring-1 focus:ring-sky-500 dark:text-gray-200"
                  required
                />
                <input
                  type="text"
                  placeholder="Work description..."
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  className="col-span-2 px-2 py-1 border border-sky-100 dark:border-gray-600 bg-white dark:bg-gray-900 rounded text-xs focus:ring-1 focus:ring-sky-500 dark:text-gray-200"
                />
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="px-2 py-1 text-[10px] text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogWork}
                  disabled={logging}
                  className="px-2 py-1 text-[10px] bg-sky-600 text-white hover:bg-sky-700 rounded transition font-bold disabled:opacity-50"
                >
                  {logging ? "Logging..." : "Log Time"}
                </button>
              </div>
            </div>
          )}

          {/* Work logs history summary */}
          {taskData.workLogs && taskData.workLogs.length > 0 && (
            <div className="space-y-1.5 pt-1 max-h-[8rem] overflow-y-auto scrollbar-thin">
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <History className="w-3 h-3 text-sky-500" /> Work Logs (
                {taskData.workLogs.length})
              </span>
              <div className="space-y-1">
                {taskData.workLogs.map((log: any) => (
                  <div
                    key={log._id}
                    className="p-1.5 bg-white/50 dark:bg-gray-800/40 rounded border border-sky-100/30 dark:border-gray-800/50 text-[10px] text-gray-600 dark:text-gray-400 flex flex-col gap-0.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {typeof log.user === "object" && log.user
                          ? log.user.name
                          : "Member"}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{log.hoursSpent}h
                      </span>
                    </div>
                    {log.description && (
                      <p className="italic text-[9px] text-gray-500 dark:text-gray-400 truncate">
                        "{log.description}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
