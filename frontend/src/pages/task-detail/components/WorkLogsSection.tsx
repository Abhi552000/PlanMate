import React, { useState } from "react";
import { Clock, Plus, Trash2, Calendar, User } from "lucide-react";
import { IWorkLog, IUser } from "../../../types";
import { ConfirmationModal } from "../../../components/ui/ConfirmationModal";

interface WorkLogsSectionProps {
  workLogs: IWorkLog[];
  originalEstimate?: number;
  timeLogged?: number;
  onLogWork: (hoursSpent: number, description?: string, date?: string) => Promise<void>;
  onDeleteWorkLog: (workLogId: string) => Promise<void>;
  loggingWork: boolean;
  deletingWorkLogId: string | null;
  currentUser: any;
  baseControlClasses: string;
}

export const WorkLogsSection: React.FC<WorkLogsSectionProps> = ({
  workLogs = [],
  originalEstimate = 0,
  timeLogged = 0,
  onLogWork,
  onDeleteWorkLog,
  loggingWork,
  deletingWorkLogId,
  currentUser,
  baseControlClasses,
}) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [hoursInput, setHoursInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [dateInput, setDateInput] = useState(new Date().toISOString().split("T")[0]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isOrgAdmin =
    currentUser?.role === "org_admin" || currentUser?.role === "sys_admin";

  const totalLogged = timeLogged || workLogs.reduce((sum, log) => sum + (log.hoursSpent || 0), 0);
  const estimate = Number(originalEstimate) || 0;
  const remaining = Math.max(0, estimate - totalLogged);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(hoursInput);
    if (isNaN(hours) || hours <= 0) return;

    await onLogWork(hours, descriptionInput.trim(), dateInput);
    setHoursInput("");
    setDescriptionInput("");
    setDateInput(new Date().toISOString().split("T")[0]);
    setShowLogForm(false);
  };

  const handleResetAndCloseForm = () => {
    setHoursInput("");
    setDescriptionInput("");
    setDateInput(new Date().toISOString().split("T")[0]);
    setShowLogForm(false);
  };

  const handleToggleForm = () => {
    if (showLogForm) {
      handleResetAndCloseForm();
    } else {
      setHoursInput("");
      setDescriptionInput("");
      setDateInput(new Date().toISOString().split("T")[0]);
      setShowLogForm(true);
    }
  };

  const handleQuickAddHours = (val: number) => {
    const current = parseFloat(hoursInput) || 0;
    const nextVal = (current + val).toFixed(1).replace(/\.0$/, "");
    setHoursInput(nextVal);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          <span>
            Total: <strong className="text-gray-900 dark:text-gray-100">{totalLogged}h</strong> logged
          </span>
          {estimate > 0 && (
            <>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span>
                <strong className="text-gray-900 dark:text-gray-100">{remaining.toFixed(1)}h</strong> remaining of {estimate}h
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleForm}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          {showLogForm ? "Cancel" : "Log Time"}
        </button>
      </div>

      {/* Log Time Form */}
      {showLogForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-xl bg-slate-50/80 dark:bg-gray-800/50 border border-sky-100 dark:border-gray-800 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Hours spent input */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Time Spent (Hours) <span className="text-amber-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  max="100"
                  placeholder="e.g. 1.5"
                  value={hoursInput}
                  onChange={(e) => setHoursInput(e.target.value)}
                  required
                  className={`${baseControlClasses} py-1.5 text-xs flex-1`}
                  autoFocus
                />
                {/* Preset Chips */}
                <div className="flex items-center gap-1 shrink-0">
                  {[
                    { label: "+30m", val: 0.5 },
                    { label: "+1h", val: 1 },
                    { label: "+2h", val: 2 },
                    { label: "+4h", val: 4 },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => handleQuickAddHours(chip.val)}
                      className="px-2 py-1 rounded text-[11px] font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-sky-400 dark:hover:border-sky-500 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className={`${baseControlClasses} py-1.5 text-xs`}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Work Description
            </label>
            <input
              type="text"
              placeholder="What did you work on? (e.g. Fixed navigation bug and added tests)"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              className={`${baseControlClasses} py-1.5 text-xs`}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleResetAndCloseForm}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loggingWork || !hoursInput || parseFloat(hoursInput) <= 0}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loggingWork ? "Saving..." : "Log Time"}
            </button>
          </div>
        </form>
      )}

      {/* Work Logs List */}
      {workLogs.length === 0 ? (
        <div className="text-center py-8 px-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
          <Clock className="w-7 h-7 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            No work logged yet
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Record time spent on this issue by clicking "Log Time" above.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {workLogs
            .slice()
            .reverse()
            .map((log: any, idx: number) => {
              const logUser = log.user as IUser | any;
              const userName = logUser?.name || "Team Member";
              const userEmail = logUser?.email || "";
              const userInitials = userName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              const isAuthor =
                currentUser?._id &&
                (logUser?._id || logUser) === currentUser._id;
              const canDelete = isOrgAdmin || isAuthor;
              const isDeleting = deletingWorkLogId === log._id;

              const formattedDate = log.createdAt
                ? new Date(log.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "";

              return (
                <div
                  key={log._id || idx}
                  className="py-3 flex items-start justify-between gap-3 group transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    {/* User Initials Avatar */}
                    <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 border border-sky-200/50 dark:border-sky-800">
                      {userInitials || <User className="w-3 h-3" />}
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {userName}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/60">
                          {log.hoursSpent}h
                        </span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {formattedDate}
                        </span>
                      </div>

                      {log.description ? (
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pt-0.5">
                          {log.description}
                        </p>
                      ) : (
                        <p className="text-[11px] text-gray-400 italic pt-0.5">
                          No notes provided
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delete Action (Org Admin or Author) */}
                  {canDelete && (
                    <div className="shrink-0 flex items-center">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(log._id)}
                        disabled={isDeleting}
                        className="p-1 rounded text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-gray-800 transition-colors cursor-pointer opacity-50 group-hover:opacity-100"
                        title="Delete work log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Delete Work Log Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId) {
            onDeleteWorkLog(confirmDeleteId);
            setConfirmDeleteId(null);
          }
        }}
        title="Delete Work Log"
        message="Are you sure you want to delete this work log entry? This action cannot be undone."
        confirmText="Delete Work Log"
        cancelText="Cancel"
        loading={Boolean(deletingWorkLogId)}
      />
    </div>
  );
};
