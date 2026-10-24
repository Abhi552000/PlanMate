import React from "react";
import { Activity } from "lucide-react";
import { ActivityTimelineSectionProps } from "../../../types";
import { MentionText } from "../../../components/MentionText";

export const ActivityTimelineSection: React.FC<ActivityTimelineSectionProps> = ({ history }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="border-t border-sky-100/50 dark:border-gray-800 pt-5 mt-5">
      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
        <Activity className="w-4 h-4 text-sky-500" /> Activity Timeline
      </label>
      
      <div className="relative pl-6 border-l border-sky-100 dark:border-gray-800 space-y-5 ml-2">
        {history.map((item, idx) => (
          <div key={idx} className="relative text-xs">
            {/* Timeline bullet indicator */}
            <div className="absolute -left-[32px] top-1 w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-white dark:border-gray-900 shadow-sm" />
            
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <span className="font-bold text-gray-800 dark:text-gray-250">
                  {item.updatedBy?.name || "Someone"}
                </span>
                <span>updated the</span>
                <span className="font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider text-[10px] bg-sky-50 dark:bg-sky-950/20 px-1.5 py-0.5 rounded border border-sky-100 dark:border-sky-900/50">
                  {item.field}
                </span>
              </div>
              
              <div className="text-[11px] text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-1.5 bg-gray-50/50 dark:bg-gray-900/50 p-2 rounded-lg border border-sky-100/30 dark:border-gray-850 max-w-full font-medium break-words">
                <span className="line-through text-red-606 dark:text-red-400">
                  <MentionText text={item.oldValue || "None"} />
                </span>
                <span className="text-gray-400 shrink-0">→</span>
                <span className="font-bold text-green-700 dark:text-green-400">
                  <MentionText text={item.newValue || "None"} />
                </span>
              </div>
              
              {item.updatedAt && (
                <span className="text-[10px] text-gray-405 dark:text-gray-500">
                  {new Date(item.updatedAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
