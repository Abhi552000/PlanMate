import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Save,
  Check,
  X,
  Pencil,
  Copy,
  ExternalLink,
  Plus,
  Link as LinkIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../../../components/ui/Button";
import { TaskDetailsHeaderProps } from "../../../types";
import { getIssueTypeIcon } from "../../../utils";

export const TaskDetailsHeader: React.FC<TaskDetailsHeaderProps> = ({
  isEditingSubtask,
  projectKey,
  issueKey,
  issueType = "Task",
  title,
  onTitleChange,
  subtaskIndex,
  onBackToParent,
  onBackToBoard,
  onSave,
  saving = false,
  isModal = false,
  onClose,
  onOpenFullPage,
  onAddSubtaskClick,
  onLinkIssueClick,
}) => {
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditingTitle) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    if (!editedTitle.trim()) {
      setEditedTitle(title);
      setIsEditingTitle(false);
      return;
    }
    if (editedTitle.trim() !== title && onTitleChange) {
      onTitleChange(editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setEditedTitle(title);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveTitle();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelTitle();
    }
  };

  const currentKey = isEditingSubtask
    ? `${issueKey || projectKey}-${(subtaskIndex ?? 0) + 1}`
    : issueKey || (projectKey.includes("-") ? projectKey : `${projectKey}-1`);

  const ticketLink = `${window.location.origin}/${currentKey}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(ticketLink);
    toast.success(`Copied ticket link (${ticketLink})`);
  };

  return (
    <div className="border-b border-sky-100/60 dark:border-gray-800 pb-4 space-y-3">
      {/* Top Breadcrumb & Controls Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {isEditingSubtask ? (
            <button
              type="button"
              onClick={onBackToParent}
              className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 bg-sky-50 dark:bg-gray-800 px-2.5 py-1 rounded-md border border-sky-100/50 dark:border-gray-700 transition-colors cursor-pointer mr-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Parent Issue
            </button>
          ) : (
            <button
              type="button"
              onClick={onBackToBoard || (() => navigate(-1))}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer mr-1"
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Project / Key Breadcrumbs */}
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            {projectKey}
          </span>
          <span className="text-gray-300 dark:text-gray-600">/</span>

          {/* Ticket Key Badge - Click to copy ticket link */}
          <div
            onClick={handleCopyLink}
            className="group/key flex items-center gap-1.5 bg-sky-50/80 dark:bg-sky-950/40 hover:bg-sky-100/80 dark:hover:bg-sky-900/50 px-2 py-0.5 rounded-md border border-sky-200/60 dark:border-sky-800/60 transition-colors cursor-pointer"
            title={`Click to copy ticket link (${ticketLink})`}
          >
            {getIssueTypeIcon(isEditingSubtask ? "Sub-task" : issueType, "w-3.5 h-3.5")}
            <span className="font-bold text-sky-800 dark:text-sky-200 select-all tracking-wide text-xs">
              {currentKey}
            </span>
            <Copy className="w-3 h-3 text-sky-400 group-hover/key:text-sky-700 dark:group-hover/key:text-sky-200 transition-colors" />
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {isModal ? (
            <>
              {onOpenFullPage && (
                <button
                  type="button"
                  onClick={onOpenFullPage}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-sky-600 dark:hover:text-sky-400 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Open in full page"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            onSave && (
              <Button
                onClick={onSave}
                loading={saving}
                size="sm"
                className="flex items-center gap-1.5 font-bold shadow-xs text-xs"
              >
                <Save className="w-3.5 h-3.5" /> Save Changes
              </Button>
            )
          )}
        </div>
      </div>

      {/* Editable Ticket Title / Summary */}
      <div className="pt-1">
        {isEditingTitle ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border-2 border-sky-500 rounded-lg px-3 py-1.5 shadow-xs focus:outline-none"
                placeholder="What needs to be done?"
              />
              <button
                type="button"
                onClick={handleSaveTitle}
                className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="Save (Enter)"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleCancelTitle}
                className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Cancel (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-gray-400">
              Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-[10px]">Enter</kbd> to save, <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded font-mono text-[10px]">Esc</kbd> to cancel
            </p>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingTitle(true)}
            className="group flex items-start justify-between gap-3 p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100/70 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
            title="Click to edit summary"
          >
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-snug">
              {title || "Untitled Issue"}
            </h1>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-sky-600 shrink-0 mt-0.5">
              <Pencil className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Toolbar (Add Subtask, Link Issue) */}
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        {!isEditingSubtask && onAddSubtaskClick && (
          <button
            type="button"
            onClick={onAddSubtaskClick}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800 dark:hover:bg-gray-700/80 rounded-md transition-colors cursor-pointer border border-gray-200/60 dark:border-gray-700/60"
          >
            <Plus className="w-3.5 h-3.5 text-gray-500" />
            Add subtask
          </button>
        )}
        {!isEditingSubtask && onLinkIssueClick && (
          <button
            type="button"
            onClick={onLinkIssueClick}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100/80 hover:bg-gray-200/80 dark:bg-gray-800 dark:hover:bg-gray-700/80 rounded-md transition-colors cursor-pointer border border-gray-200/60 dark:border-gray-700/60"
          >
            <LinkIcon className="w-3.5 h-3.5 text-gray-500" />
            Link issue
          </button>
        )}
      </div>
    </div>
  );
};
