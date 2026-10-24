import React from "react";
import { Activity, ArrowRight, Minus, Plus } from "lucide-react";
import { ActivityTimelineSectionProps } from "../../../types";
import { MentionText } from "../../../components/MentionText";

export const ActivityTimelineSection: React.FC<ActivityTimelineSectionProps> = ({ history }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="border-t border-sky-100/50 dark:border-gray-800 pt-6 mt-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
          <Activity className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Activity Timeline
        </h4>
        <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
          {history.length}
        </span>
      </div>

      <div className="relative pl-6 ml-2 space-y-6">
        {/* Continuous vertical timeline connector line */}
        <div className="absolute left-[3px] top-2.5 bottom-2.5 w-0.5 bg-sky-200/60 dark:bg-gray-800" />

        {history.map((item, idx) => {
          const authorName = item.updatedBy?.name || "Someone";
          const authorInitial = authorName.trim().charAt(0).toUpperCase() || "U";
          const isLongText =
            item.field?.toLowerCase() === "description" ||
            (item.newValue && item.newValue.length > 50) ||
            (item.oldValue && item.oldValue.length > 50) ||
            (item.newValue && item.newValue.includes("\n"));

          return (
            <div key={idx} className="relative group">
              {/* Timeline node bullet */}
              <div className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-sky-500 border-2 border-white dark:border-gray-900 shadow-xs ring-4 ring-sky-500/10 dark:ring-sky-500/20" />

              <div className="flex flex-col gap-1.5">
                {/* Header row: Author + Action + Field + Timestamp */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 text-white font-bold text-[9px] flex items-center justify-center uppercase shrink-0 shadow-xs">
                    {authorInitial}
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {authorName}
                  </span>
                  <span className="text-gray-400 font-normal">updated</span>
                  <span className="font-bold text-[10px] text-sky-600 dark:text-sky-400 uppercase tracking-wider bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-md border border-sky-100 dark:border-sky-900/50">
                    {item.field}
                  </span>
                  {item.updatedAt && (
                    <>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-normal">
                        {new Date(item.updatedAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </>
                  )}
                </div>

                {/* Diff Representation */}
                {isLongText ? (
                  /* Multi-line / Description diff: Structured Before & After cards */
                  <div className="mt-1 space-y-2 max-w-2xl">
                    {item.oldValue && item.oldValue !== "None" && item.oldValue !== item.newValue && (
                      <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl p-3 text-xs shadow-xs">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 mb-1 flex items-center gap-1">
                          <Minus className="w-3 h-3" /> Previous
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 line-through opacity-80 whitespace-pre-wrap leading-relaxed break-words">
                          <MentionText text={item.oldValue} />
                        </div>
                      </div>
                    )}

                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl p-3 text-xs shadow-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Updated
                      </div>
                      <div className="text-gray-800 dark:text-gray-200 font-medium whitespace-pre-wrap leading-relaxed break-words">
                        <MentionText text={item.newValue || "None"} />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Compact Inline Pill for Status, Priority, Assignee, etc. */
                  <div className="mt-0.5 inline-flex items-center gap-2 bg-gray-50/80 dark:bg-gray-850/80 px-2.5 py-1 rounded-lg border border-sky-100/60 dark:border-gray-800 text-xs w-fit shadow-xs">
                    <span className="text-red-500 dark:text-red-400 font-medium line-through">
                      <MentionText text={item.oldValue || "None"} />
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      <MentionText text={item.newValue || "None"} />
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
