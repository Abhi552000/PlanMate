import React, { useState, useMemo } from "react";
import { Link as LinkIcon, Plus, X, Search, ChevronDown, ChevronRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IssueLinkingSectionProps } from "../../../types";
import { getIssueTypeIcon, getPriorityStyle } from "../../../utils";

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
  baseControlClasses = "w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white dark:bg-gray-900",
  onNavigateToTask,
}) => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Filter available tasks to link (exclude already-linked tasks)
  const linkedTaskIds = useMemo(() => {
    return new Set(
      links.map((l) => (typeof l.targetTask === "object" ? l.targetTask?._id : l.targetTask)).filter(Boolean)
    );
  }, [links]);

  const availableTasks = useMemo(() => {
    return workspaceTasks.filter((t) => {
      if (linkedTaskIds.has(t._id)) return false;
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      const key = (t.key || "").toLowerCase();
      const title = (t.title || "").toLowerCase();
      return key.includes(q) || title.includes(q);
    });
  }, [workspaceTasks, linkedTaskIds, searchFilter]);

  // Group existing links by relationship type
  const groupedLinks = useMemo(() => {
    const groups: Record<string, any[]> = {};
    links.forEach((link) => {
      const type = link.linkType || "relates to";
      if (!groups[type]) groups[type] = [];
      groups[type].push(link);
    });
    return groups;
  }, [links]);

  const toggleGroup = (type: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleTaskClick = (taskId: string) => {
    if (onNavigateToTask) {
      onNavigateToTask(taskId);
    } else {
      navigate(`/task/${taskId}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    await onAddLink(e);
    setShowAddForm(false);
    setSearchFilter("");
  };

  return (
    <div id="issue-linking-section" className="border-t border-sky-100/60 dark:border-gray-800 pt-5 mt-6 space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <LinkIcon className="w-3.5 h-3.5 text-sky-500" /> Linked Issues
          </label>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {links.length}
          </span>
        </div>

        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 px-2 py-1 rounded hover:bg-sky-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Link issue
          </button>
        )}
      </div>

      {/* Add Link Inline Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-3.5 bg-gray-50/80 dark:bg-gray-850/60 rounded-xl border border-sky-100 dark:border-gray-800 space-y-3"
        >
          <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-800 pb-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
              Link another issue
            </span>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setSearchFilter("");
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
            {/* Relationship selector */}
            <div className="sm:col-span-5">
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Relationship
              </label>
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value)}
                className={`${baseControlClasses} font-medium text-xs`}
              >
                <option value="blocks">blocks</option>
                <option value="is blocked by">is blocked by</option>
                <option value="relates to">relates to</option>
                <option value="duplicates">duplicates</option>
                <option value="is duplicated by">is duplicated by</option>
                <option value="clones">clones</option>
                <option value="is cloned by">is cloned by</option>
              </select>
            </div>

            {/* Target issue picker with search */}
            <div className="sm:col-span-7">
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                Select issue to link
              </label>
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search by key or summary..."
                    className="w-full pl-8 pr-3 py-1.5 border border-sky-100 dark:border-gray-800 rounded-lg text-xs bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <select
                  value={targetTaskId}
                  onChange={(e) => setTargetTaskId(e.target.value)}
                  className={`${baseControlClasses} font-medium text-xs`}
                  required
                >
                  <option value="">Choose issue...</option>
                  {availableTasks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.key ? `[${t.key}] ` : ""}{t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-200/40 dark:border-gray-800">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setSearchFilter("");
              }}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={linking || !targetTaskId}
              className="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              {linking ? "Linking..." : "Link"}
            </button>
          </div>
        </form>
      )}

      {/* Linked Issues Grouped List */}
      <div className="space-y-3 pt-1">
        {Object.keys(groupedLinks).length === 0 && !showAddForm && (
          <div className="text-center py-4 px-3 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-gray-400">
            <p className="text-xs">No linked issues yet.</p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="mt-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              + Link an issue to track dependencies
            </button>
          </div>
        )}

        {Object.entries(groupedLinks).map(([relationGroup, groupItems]) => {
          const isCollapsed = collapsedGroups[relationGroup];

          return (
            <div
              key={relationGroup}
              className="border border-sky-100/60 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900/60 shadow-2xs"
            >
              {/* Group Header */}
              <button
                type="button"
                onClick={() => toggleGroup(relationGroup)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50/70 dark:bg-gray-800/40 hover:bg-gray-100/60 dark:hover:bg-gray-800/70 transition-colors text-left cursor-pointer border-b border-sky-100/40 dark:border-gray-800/80"
              >
                <div className="flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200 capitalize">
                    {relationGroup}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-50 dark:bg-gray-800 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-gray-700">
                    {groupItems.length}
                  </span>
                </div>
              </button>

              {/* Group Issue Rows */}
              {!isCollapsed && (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {groupItems.map((link) => {
                    const target = link.targetTask;
                    if (!target || typeof target !== "object") return null;

                    const isTargetDone =
                      target.completed === true ||
                      target.completed === "Yes" ||
                      target.status?.toLowerCase() === "done" ||
                      target.status?.toLowerCase() === "closed";

                    return (
                      <div
                        key={link._id}
                        className="group flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-sky-50/40 dark:hover:bg-gray-800/40 transition-colors"
                      >
                        {/* Left: Type Icon + Key + Title */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {getIssueTypeIcon(target.issueType, "w-3.5 h-3.5")}

                          {target.key ? (
                            <button
                              type="button"
                              onClick={() => handleTaskClick(target._id)}
                              className="font-bold text-xs text-sky-600 dark:text-sky-400 hover:underline shrink-0 cursor-pointer"
                            >
                              {target.key}
                            </button>
                          ) : null}

                          <span
                            onClick={() => handleTaskClick(target._id)}
                            className={`text-xs font-semibold text-gray-800 dark:text-gray-200 truncate cursor-pointer hover:text-sky-600 dark:hover:text-sky-400 transition-colors ${
                              isTargetDone ? "line-through text-gray-400 dark:text-gray-500" : ""
                            }`}
                            title={target.title}
                          >
                            {target.title}
                          </span>
                        </div>

                        {/* Right: Priority + Status Pill + Unlink Button */}
                        <div className="flex items-center gap-2 shrink-0">
                          {target.priority && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider hidden sm:inline-block ${getPriorityStyle(
                                target.priority
                              )}`}
                            >
                              {target.priority}
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              isTargetDone
                                ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900"
                                : "text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900"
                            }`}
                          >
                            {target.status || "To Do"}
                          </span>

                          <button
                            type="button"
                            onClick={() => onRemoveLink(link._id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                            title="Unlink issue"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
