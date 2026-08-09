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
        <label className=" block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Summary
        </label>
        <div className="flex items-center border border-sky-100 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-sky-500 transition-all duration-200">
          <input
            type="text"
            name="title"
            required
            value={title}
            onChange={onChange}
            className="w-full focus:outline-none text-xs text-gray-700 dark:text-gray-300 font-medium bg-transparent"
            placeholder="Provide a brief summary of the issue"
          />
        </div>
      </div>

      <div>
        <label className=" flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          <AlignLeft className=" w-4 h-4 text-sky-500" /> Description
        </label>
        <MentionInput
          type="textarea"
          rows={5}
          name="description"
          value={description}
          onChange={onChange}
          members={members}
          className={`${baseControlClasses} resize-none text-gray-800`}
          placeholder="Add details about this issue..."
        />
      </div>
    </div>
  );
};
