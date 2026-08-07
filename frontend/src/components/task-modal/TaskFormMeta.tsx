import React from "react";
import { CheckCircle, AlignLeft, Flag, User, Calendar, Layers } from "lucide-react";
import { priorityStyles } from "../../assets/dummy";

interface TaskFormMetaProps {
  taskData: any;
  setTaskData: React.Dispatch<React.SetStateAction<any>>;
  statuses: string[];
  members: any[];
  sprints?: any[];
  epics?: any[];
  parentTask: any;
  today: string;
  baseControlClasses: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

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
  return (
    <div className="md:col-span-5 mt-4 md:mt-0 space-y-4 bg-sky-50/20 p-4 rounded-xl border border-sky-100/50 self-start">
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
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
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
          className={`${baseControlClasses} font-semibold disabled:bg-gray-50 disabled:text-gray-400`}
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

      <div>
        <label className=" flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
          <Flag className=" w-3.5 h-3.5 text-sky-500" /> Story Points
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
    </div>
  );
};
