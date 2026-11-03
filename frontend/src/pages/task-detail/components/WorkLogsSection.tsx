import React, { useState } from "react";
import { Clock, Plus, Trash2, Calendar, User, CheckCircle2, AlertCircle } from "lucide-react";
import { IWorkLog, IUser } from "../../../types";

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
  const progressPercent = estimate > 0 ? Math.min(100, Math.round((totalLogged / estimate) * 100)) : 0;
  const isOverEstimate = estimate > 0 && totalLogged > estimate;

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

  const handleQuickAddHours = (additional: number) => {
    const current = parseFloat(hoursInput) || 0;
    const nextVal = (current + additional).toFixed(1).replace(/\.0$/, "");
    setHoursInput(nextVal);
  };

  return (
    <div className="space-y-6">
      {/* Time Tracking Overview Card */}
      <div className="bg-slate-50/70 dark:bg-gray-800/40 p-4 sm:p-5 rounded-xl border border-sky-100/70 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-500" />
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                Time Tracking & Progress
              </h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Logged work history and remaining effort
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowLogForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            {showLogForm ? "Cancel" : "Log Work"}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isOverEstimate
                  ? "bg-amber-500 dark:bg-amber-400"
                  : "bg-sky-500 dark:bg-sky-400"
              }`}
              style={{ width: `${estimate > 0 ? Math.min(100, progressPercent) : totalLogged > 0 ? 100 : 0}%` }}
            />
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center sm:text-left">
            <div className="bg-white dark:bg-gray-900/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/80">
              <span className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Logged
              </span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {totalLogged}h
              </span>
            </div>

            <div className="bg-white dark:bg-gray-900/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/80">
              <span className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Estimated
              </span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {estimate > 0 ? `${estimate}h` : "None"}
              </span>
            </div>

            <div className="bg-white dark:bg-gray-900/60 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/80">
              <span className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Remaining
              </span>
              <span
                className={`text-sm font-bold ${
                  isOverEstimate
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-gray-800 dark:text-gray-100"
                }`}
              >
                {estimate > 0 ? (isOverEstimate ? `+${(totalLogged - estimate).toFixed(1)}h over` : `${remaining.toFixed(1)}h`) : "--"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Log Work Form (Collapsible) */}
      {showLogForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-xl border border-sky-200 dark:border-sky-900/40 shadow-xs space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
              New Work Log Entry
            </h5>
            <span className="text-[11px] text-gray-400">
              Recorded in task history
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Time Spent (Hours) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.25"
                min="0.1"
                max="100"
                placeholder="e.g. 1.5"
                value={hoursInput}
                onChange={(e) => setHoursInput(e.target.value)}
                required
                className={baseControlClasses}
              />
              {/* Quick preset chips */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-gray-400 mr-1">Quick add:</span>
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
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 dark:bg-gray-800 hover:bg-sky-50 dark:hover:bg-sky-950 text-gray-600 dark:text-gray-300 hover:text-sky-600 transition-colors cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Date Worked
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className={baseControlClasses}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
              Work Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="What did you work on or accomplish? (e.g., Debugged API integration and tested edge cases)"
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              className={baseControlClasses}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowLogForm(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loggingWork || !hoursInput || parseFloat(hoursInput) <= 0}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {loggingWork ? "Saving..." : "Save Log"}
            </button>
          </div>
        </form>
      )}

      {/* Work Logs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Work Log Entries ({workLogs.length})
          </h5>
          {isOrgAdmin && (
            <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
              Org Admin Management Mode
            </span>
          )}
        </div>

        {workLogs.length === 0 ? (
          <div className="text-center py-8 px-4 bg-gray-50/50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              No work logged yet
            </p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-sm mx-auto">
              Track your team's hours spent on this issue by clicking "Log Work" above.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
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
                    className="py-3 sm:py-3.5 flex items-start justify-between gap-3 group transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-sky-200/60 dark:border-sky-800">
                        {userInitials || <User className="w-3.5 h-3.5" />}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                            {userName}
                          </span>
                          {userEmail && (
                            <span className="text-[11px] text-gray-400 hidden sm:inline">
                              ({userEmail})
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/60">
                            +{log.hoursSpent}h
                          </span>
                        </div>

                        {log.description ? (
                          <p className="text-xs text-gray-600 dark:text-gray-300 break-words leading-relaxed">
                            {log.description}
                          </p>
                        ) : (
                          <p className="text-[11px] text-gray-400 italic">
                            No description provided
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {formattedDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Action (Org Admin or Author) */}
                    {canDelete && (
                      <div className="shrink-0 flex items-center">
                        {confirmDeleteId === log._id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 p-1 rounded-lg border border-red-200 dark:border-red-900">
                            <span className="text-[10px] text-red-600 dark:text-red-400 font-medium px-1">
                              Delete?
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteWorkLog(log._id);
                                setConfirmDeleteId(null);
                              }}
                              disabled={isDeleting}
                              className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded hover:bg-red-700 cursor-pointer disabled:opacity-50"
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] rounded hover:bg-gray-300 cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(log._id)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                            title={isOrgAdmin ? "Delete work log (Org Admin)" : "Delete your work log"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
