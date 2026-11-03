import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, User, Calendar, Search, Trash2, ArrowUpRight, BarChart2, Filter } from "lucide-react";
import { toast } from "react-toastify";
import { ITask } from "../../../types";
import { taskService } from "../../../services/taskService";

interface ReportTimeTrackingViewProps {
  tasks: ITask[];
  onRefresh: () => void;
  currentUser: any;
}

interface FlattenedWorkLog {
  workLogId: string;
  taskId: string;
  taskKey: string;
  taskTitle: string;
  issueType: string;
  hoursSpent: number;
  description: string;
  createdAt: string | Date;
  user: {
    _id?: string;
    name?: string;
    email?: string;
  };
}

export const ReportTimeTrackingView: React.FC<ReportTimeTrackingViewProps> = ({
  tasks = [],
  onRefresh,
  currentUser,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isOrgAdmin =
    currentUser?.role === "org_admin" || currentUser?.role === "sys_admin";

  // Flatten all work logs from all tasks
  const allLogs: FlattenedWorkLog[] = useMemo(() => {
    const list: FlattenedWorkLog[] = [];
    tasks.forEach((t) => {
      const taskKey = t.key || (t._id ? `PM-${t._id.slice(-4).toUpperCase()}` : "PM-1");
      const taskTitle = t.title || "Untitled Issue";
      const issueType = t.issueType || "Task";

      (t.workLogs || []).forEach((log: any) => {
        const logUser = typeof log.user === "object" && log.user !== null ? log.user : {};
        list.push({
          workLogId: log._id || `${t._id}-${Math.random()}`,
          taskId: t._id,
          taskKey,
          taskTitle,
          issueType,
          hoursSpent: Number(log.hoursSpent) || 0,
          description: log.description || "",
          createdAt: log.createdAt || new Date(),
          user: {
            _id: logUser._id || (typeof log.user === "string" ? log.user : ""),
            name: logUser.name || "Team Member",
            email: logUser.email || "",
          },
        });
      });
    });

    // Sort newest first
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [tasks]);

  // Aggregate Metrics
  const totalHoursLogged = useMemo(
    () => allLogs.reduce((sum, l) => sum + l.hoursSpent, 0),
    [allLogs]
  );

  const uniqueTasksLogged = useMemo(
    () => new Set(allLogs.map((l) => l.taskId)).size,
    [allLogs]
  );

  // Group by Member for breakdown
  const memberBreakdowns = useMemo(() => {
    const map = new Map<
      string,
      { name: string; email: string; hours: number; taskCount: Set<string> }
    >();

    allLogs.forEach((l) => {
      const key = l.user._id || l.user.name || "unknown";
      if (!map.has(key)) {
        map.set(key, {
          name: l.user.name || "Team Member",
          email: l.user.email || "",
          hours: 0,
          taskCount: new Set<string>(),
        });
      }
      const entry = map.get(key)!;
      entry.hours += l.hoursSpent;
      entry.taskCount.add(l.taskId);
    });

    return Array.from(map.values()).sort((a, b) => b.hours - a.hours);
  }, [allLogs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      const matchesSearch =
        !searchTerm.trim() ||
        log.taskKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMember =
        selectedMember === "all" ||
        (log.user._id && log.user._id === selectedMember) ||
        log.user.name === selectedMember;

      return matchesSearch && matchesMember;
    });
  }, [allLogs, searchTerm, selectedMember]);

  const handleDeleteWorkLog = async (taskId: string, workLogId: string) => {
    setDeletingId(workLogId);
    try {
      const res = await taskService.deleteWorkLog(taskId, workLogId);
      if (res?.success) {
        toast.success("Work log removed successfully");
        onRefresh();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete work log");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Total Hours Logged
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalHoursLogged.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              hours
            </span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Across {allLogs.length} total entries
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Active Issues Logged
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {uniqueTasksLogged}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              issues
            </span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            With recorded work effort
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Contributors
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {memberBreakdowns.length}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              members
            </span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Logged work in timeframe
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Avg Hours / Issue
          </span>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {uniqueTasksLogged > 0 ? (totalHoursLogged / uniqueTasksLogged).toFixed(1) : "0.0"}
            </span>
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              hrs/task
            </span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Effort concentration
          </span>
        </div>
      </div>

      {/* Team Member Contribution Leaderboard */}
      {memberBreakdowns.length > 0 && (
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-sky-500" />
            Team Member Effort Distribution
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {memberBreakdowns.map((member, idx) => {
              const percent = totalHoursLogged > 0 ? Math.round((member.hours / totalHoursLogged) * 100) : 0;
              const initials = member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-gray-800/40 border border-slate-100 dark:border-gray-800/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-200/50 dark:border-sky-800">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate block">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-gray-400 truncate block">
                          {member.taskCount.size} issue{member.taskCount.size !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {member.hours.toFixed(1)}h
                      </span>
                      <span className="text-[10px] text-gray-400 block font-medium">
                        {percent}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 dark:bg-sky-400 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Organization Work Logs Audit Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              All Organization Work Logs
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Complete history of recorded effort across all issues ({filteredLogs.length} logs)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search logs, issues, members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500 w-44 sm:w-56"
              />
            </div>

            {/* Member Filter */}
            {memberBreakdowns.length > 0 && (
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                <option value="all">All</option>
                {memberBreakdowns.map((m, i) => (
                  <option key={i} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Table Content */}
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center px-4">
            <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              No work logs found
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {searchTerm || selectedMember !== "all"
                ? "Try clearing your filters or search keywords."
                : "Your team has not recorded any work logs in this timeframe yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Issue</th>
                  <th className="py-3 px-4">Team Member</th>
                  <th className="py-3 px-4">Hours</th>
                  <th className="py-3 px-4">Description / Notes</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredLogs.map((log) => {
                  const initials = (log.user.name || "TM")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  const isAuthor =
                    currentUser?._id && log.user._id === currentUser._id;
                  const canDelete = isOrgAdmin || isAuthor;
                  const isDeleting = deletingId === log.workLogId;

                  const formattedDate = log.createdAt
                    ? new Date(log.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "";

                  return (
                    <tr
                      key={log.workLogId}
                      className="hover:bg-slate-50/60 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* Issue Key & Title */}
                      <td className="py-3 px-4 font-medium">
                        <button
                          type="button"
                          onClick={() => navigate(`/task/${log.taskId}`)}
                          className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1.5 font-bold cursor-pointer text-left"
                        >
                          <span>{log.taskKey}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-60" />
                        </button>
                        <span className="text-gray-600 dark:text-gray-300 block truncate max-w-xs mt-0.5">
                          {log.taskTitle}
                        </span>
                      </td>

                      {/* Team Member */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-[10px] shrink-0 border border-sky-200/50 dark:border-sky-800">
                            {initials}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                              {log.user.name}
                            </span>
                            {log.user.email && (
                              <span className="text-[10px] text-gray-400 block">
                                {log.user.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Hours Spent */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/60">
                          +{log.hoursSpent}h
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 max-w-sm">
                        {log.description ? (
                          <span className="text-gray-700 dark:text-gray-300 line-clamp-2">
                            {log.description}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">No notes</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/task/${log.taskId}`)}
                            className="p-1 rounded text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            title="Open issue details"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>

                          {canDelete && (
                            <>
                              {confirmDeleteId === log.workLogId ? (
                                <div className="inline-flex items-center gap-1 bg-red-50 dark:bg-red-950/40 p-0.5 rounded border border-red-200 dark:border-red-900 text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteWorkLog(log.taskId, log.workLogId)
                                    }
                                    disabled={isDeleting}
                                    className="px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer disabled:opacity-50"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 cursor-pointer"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(log.workLogId)}
                                  disabled={isDeleting}
                                  className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                  title={
                                    isOrgAdmin
                                      ? "Delete work log (Org Admin)"
                                      : "Delete your work log"
                                  }
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
