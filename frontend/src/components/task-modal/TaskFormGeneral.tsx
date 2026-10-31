import React from "react";
import { AlignLeft } from "lucide-react";
import { TaskFormGeneralProps } from "../../types";
import { MentionInput } from "../MentionInput";

export const TaskFormGeneral: React.FC<TaskFormGeneralProps> = ({
  title,
  description,
  onChange,
  baseControlClasses,
  members,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <span>Summary</span>
          <span className="text-red-500 font-bold">*</span>
        </label>
        <input
          type="text"
          name="title"
          required
          value={title}
          onChange={onChange}
          className="w-full h-[38px] px-3.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-gray-800 hover:border-slate-300 dark:hover:border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 focus:outline-none transition-colors duration-150 font-medium"
          placeholder="Provide a brief summary of the issue"
        />
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          <AlignLeft className="w-3.5 h-3.5 text-sky-500" />
          <span>Description</span>
        </label>
        <MentionInput
          type="textarea"
          rows={5}
          name="description"
          value={description}
          onChange={onChange}
          members={members}
          className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-gray-800 hover:border-slate-300 dark:hover:border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 focus:outline-none transition-colors duration-150 resize-y min-h-[110px] leading-relaxed"
          placeholder="Add details about this issue... Type @ to mention team members"
        />
      </div>
    </div>
  );
};
