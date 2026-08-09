import React from "react";
import { Link as LinkIcon, X } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { IssueLinkingSectionProps } from "../../../types";

export const IssueLinkingSection: React.FC<IssueLinkingSectionProps> = ({
  linkType,
  setLinkType,
  targetTaskId,
  setTargetTaskId,
  workspaceTasks,
  linking,
  links,
  onAddLink,
  onRemoveLink,
  baseControlClasses,
}) => {
  return (
    <div className="border-t border-sky-100/50 dark:border-gray-800 pt-4 mt-4 space-y-3">
      <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
        <LinkIcon className="w-3.5 h-3.5 text-sky-505" /> Issue Linking
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
            <div key={link._id} className="flex items-center justify-between gap-2 p-2 bg-sky-50/20 dark:bg-sky-955/10 rounded-xl border border-sky-100/30 dark:border-gray-800 text-xs">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 capitalize">
                    {link.linkType}
                  </span>
                  <span className="font-semibold text-gray-500 text-[10px]">
                    {target.key || "PM"}
                  </span>
                </div>
                <p className={`truncate text-gray-750 dark:text-gray-300 font-bold mt-0.5 ${isTargetDone ? "line-through text-gray-405" : ""}`} title={target.title}>
                  {target.title}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                  isTargetDone ? "text-green-605 bg-green-50/50 border-green-200" : "text-sky-605 bg-sky-50/50 border-sky-200"
                }`}>
                  {target.status || "To Do"}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveLink(link._id!)}
                  className="text-gray-405 hover:text-red-505 transition-colors p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
