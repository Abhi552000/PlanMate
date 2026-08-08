import React from "react";
import { AlignLeft } from "lucide-react";
import { TaskDescriptionSectionProps } from "../../../types";

export const TaskDescriptionSection: React.FC<TaskDescriptionSectionProps> = ({
  title,
  description,
  onChange,
  baseControlClasses,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
          Summary
        </label>
        <div className="flex items-center border border-sky-100 dark:border-gray-800 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-900 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
          <input
            type="text"
            name="title"
            required
            value={title}
            onChange={onChange}
            className="w-full focus:outline-none text-base text-gray-800 dark:text-gray-200 font-semibold bg-transparent"
            placeholder="Summary title of the issue"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
          <AlignLeft className="w-4 h-4 text-sky-500" /> Description
        </label>
        <textarea
          rows={8}
          name="description"
          value={description}
          onChange={onChange}
          className={`${baseControlClasses} resize-none text-gray-800 dark:text-gray-300 text-sm`}
          placeholder="Add comprehensive details about this issue..."
        />
      </div>
    </div>
  );
};
