import React from "react";
import { AlignLeft } from "lucide-react";
import { TaskDescriptionSectionProps } from "../../../types";
import { MentionInput } from "../../../components/MentionInput";

export const TaskDescriptionSection: React.FC<TaskDescriptionSectionProps> = ({
  description,
  onChange,
  baseControlClasses,
  members,
}) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <AlignLeft className="w-3.5 h-3.5 text-sky-500" /> Description
      </label>
      <MentionInput
        type="textarea"
        rows={6}
        name="description"
        value={description}
        onChange={onChange}
        members={members}
        className={`${baseControlClasses} !h-auto min-h-[140px] p-3 resize-y text-slate-800 dark:text-slate-100 text-sm leading-relaxed`}
        placeholder="Add a detailed description... Type @ to mention team members"
      />
    </div>
  );
};
