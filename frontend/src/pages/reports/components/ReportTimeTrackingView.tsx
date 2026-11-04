import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  User,
  Calendar,
  ChevronRight,
  Download,
  ArrowUpRight,
  Users,
  Briefcase,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "react-toastify";
import { taskService } from "../../../services/taskService";
import {
  TableCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "../../../components/ui/Table";
import { Pagination } from "../../../components/ui/Pagination";
import { SearchInput } from "../../../components/ui/SearchInput";
import { Button } from "../../../components/ui/Button";

interface ReportTimeTrackingViewProps {
  timeframe: "all" | "30d" | "7d" | string;
  startDate?: string;
  endDate?: string;
  currentUser: any;
}

interface UserWorklogSummary {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  totalHours: number;
  taskCount: number;
  logCount: number;
  lastLoggedAt?: string;
}

interface DetailedLogItem {
  taskId: string;
  taskKey: string;
  taskTitle: string;
  issueType: string;
  status: string;
  priority: string;
  originalEstimate: number;
  timeLogged: number;
  workLogId: string;
  hoursSpent: number;
  description: string;
  createdAt: string;
}

interface UserAccordionState {
  loading: boolean;
  page: number;
  totalPages: number;
  totalCount: number;
  logs: DetailedLogItem[];
  error?: string;
}

export const ReportTimeTrackingView: React.FC<ReportTimeTrackingViewProps> = ({
  timeframe = "all",
  startDate,
  endDate,
  currentUser,
}) => {
  const navigate = useNavigate();

  // Master Users List State
  const [users, setUsers] = useState<UserWorklogSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Summary Metrics State (from backend aggregation)
  const [overallSummary, setOverallSummary] = useState({
    totalHours: 0,
    activeContributors: 0,
    trackedTasksCount: 0,
  });

  // Accordion Expand/Collapse Map for users
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(new Set());

  // Per-user lazy-loaded detailed data cache
  const [userDetailsCache, setUserDetailsCache] = useState<
    Record<string, UserAccordionState>
  >({});

  // Per-user search query and debounce ref for detailed issue logs
  const [userSearchQueries, setUserSearchQueries] = useState<Record<string, string>>({});
  const userSearchTimeoutRef = useRef<Record<string, any>>({});

  // Export Loading States
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingUserId, setExportingUserId] = useState<string | null>(null);

  const isOrgAdmin =
    currentUser?.role === "org_admin" || currentUser?.role === "sys_admin";

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setUserPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch paginated user summaries from backend
  const fetchUserSummaries = useCallback(
    async (pageToFetch = userPage) => {
      setLoadingUsers(true);
      try {
        const params = new URLSearchParams({
          page: String(pageToFetch),
          limit: "10",
          timeframe,
        });

        if (debouncedSearch.trim()) {
          params.append("search", debouncedSearch.trim());
        }
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const data = await taskService.getUserWorklogSummaries(params);
        if (data?.success) {
          setUsers(data.users || []);
          setUserPage(data.pagination?.currentPage || 1);
          setTotalUserPages(data.pagination?.totalPages || 1);
          setTotalUsersCount(data.pagination?.totalCount || 0);
          if (data.summary) {
            setOverallSummary(data.summary);
          }
        }
      } catch (err: any) {
        console.error("Failed to load user worklog summaries:", err);
        toast.error("Failed to load time tracking data");
      } finally {
        setLoadingUsers(false);
      }
    },
    [userPage, timeframe, debouncedSearch, startDate, endDate]
  );

  useEffect(() => {
    fetchUserSummaries(userPage);
  }, [fetchUserSummaries, userPage]);

  // Clean up user search debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(userSearchTimeoutRef.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  // Lazy-load detailed tickets for a specific user on accordion expand
  const fetchUserLogs = useCallback(
    async (userId: string, targetPage = 1, searchQueryOverride?: string) => {
      setUserDetailsCache((prev) => ({
        ...prev,
        [userId]: {
          ...(prev[userId] || {
            loading: true,
            page: 1,
            totalPages: 1,
            totalCount: 0,
            logs: [],
          }),
          loading: true,
          error: undefined,
        },
      }));

      try {
        const activeSearch =
          searchQueryOverride !== undefined
            ? searchQueryOverride
            : userSearchQueries[userId] || "";

        const params = new URLSearchParams({
          page: String(targetPage),
          limit: "5",
          timeframe,
        });
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (activeSearch.trim()) params.append("search", activeSearch.trim());

        const data = await taskService.getUserDetailedWorklogs(userId, params);
        if (data?.success) {
          setUserDetailsCache((prev) => ({
            ...prev,
            [userId]: {
              loading: false,
              page: data.pagination?.currentPage || 1,
              totalPages: data.pagination?.totalPages || 1,
              totalCount: data.pagination?.totalCount || 0,
              logs: data.logs || [],
            },
          }));
        } else {
          throw new Error(data?.message || "Failed to load user logs");
        }
      } catch (err: any) {
        setUserDetailsCache((prev) => ({
          ...prev,
          [userId]: {
            ...(prev[userId] || {
              loading: false,
              page: 1,
              totalPages: 1,
              totalCount: 0,
              logs: [],
            }),
            loading: false,
            error: err?.message || "Failed to load logs",
          },
        }));
      }
    },
    [timeframe, startDate, endDate, userSearchQueries]
  );

  // Handle per-user issue logs search with debounce
  const handleUserSearchChange = (userId: string, val: string) => {
    setUserSearchQueries((prev) => ({ ...prev, [userId]: val }));
    if (userSearchTimeoutRef.current[userId]) {
      clearTimeout(userSearchTimeoutRef.current[userId]);
    }
    userSearchTimeoutRef.current[userId] = setTimeout(() => {
      fetchUserLogs(userId, 1, val);
    }, 300);
  };

  // Toggle Accordion
  const toggleUserAccordion = (userId: string) => {
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
        // If not already fetched, lazy load page 1
        if (!userDetailsCache[userId]?.logs?.length) {
          fetchUserLogs(userId, 1);
        }
      }
      return next;
    });
  };

  // Helper to download CSV
  const downloadCSVBlob = (logs: any[], filename: string) => {
    const headers = [
      "Date",
      "Issue Key",
      "Issue Title",
      "Issue Type",
      "Status",
      "Member Name",
      "Member Email",
      "Hours Spent",
      "Description",
    ];

    const rows = logs.map((log) => [
      `"${new Date(log.createdAt).toISOString().split("T")[0]}"`,
      `"${(log.taskKey || "").replace(/"/g, '""')}"`,
      `"${(log.taskTitle || "").replace(/"/g, '""')}"`,
      `"${(log.issueType || "Task").replace(/"/g, '""')}"`,
      `"${(log.status || "To Do").replace(/"/g, '""')}"`,
      `"${(log.userName || "").replace(/"/g, '""')}"`,
      `"${(log.userEmail || "").replace(/"/g, '""')}"`,
      log.hoursSpent,
      `"${(log.description || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Export All Employees Report
  const handleExportAll = async () => {
    setExportingAll(true);
    try {
      const params = new URLSearchParams({ timeframe });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await taskService.exportWorklogs(params);
      if (data?.success && data?.logs?.length) {
        downloadCSVBlob(
          data.logs,
          `organization_worklogs_${timeframe}_${new Date().toISOString().split("T")[0]}.csv`
        );
        toast.success("Organization work logs report exported");
      } else {
        toast.info("No work logs found to export for this timeframe");
      }
    } catch (err: any) {
      toast.error("Failed to export organization work logs");
    } finally {
      setExportingAll(false);
    }
  };

  // 2. Export Specific User Report
  const handleExportUser = async (userId: string, userName: string) => {
    setExportingUserId(userId);
    try {
      const params = new URLSearchParams({ userId, timeframe });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const data = await taskService.exportWorklogs(params);
      if (data?.success && data?.logs?.length) {
        const cleanName = userName.toLowerCase().replace(/[^a-z0-9]/g, "_");
        downloadCSVBlob(
          data.logs,
          `worklogs_${cleanName}_${new Date().toISOString().split("T")[0]}.csv`
        );
        toast.success(`Exported work logs for ${userName}`);
      } else {
        toast.info(`No logs found to export for ${userName}`);
      }
    } catch (err: any) {
      toast.error("Failed to export user work logs");
    } finally {
      setExportingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 3 Executive High-Impact Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Total Hours Logged
            </span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {overallSummary.totalHours.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
              hours
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Active Contributors
            </span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {overallSummary.activeContributors}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              members
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Issues Tracked
            </span>
            <Briefcase className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {overallSummary.trackedTasksCount}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              issues
            </span>
          </div>
        </div>
      </div>

      {/* Main TableCard: Employee Worklog Summaries */}
      <TableCard>
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Employee Time Logs
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Custom SearchInput */}
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search employee name or email..."
              className="w-full sm:w-64"
            />

            {/* Global Export All Button */}
            <Button
              variant="outline"
              size="sm"
              loading={exportingAll}
              onClick={handleExportAll}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export All Employees (CSV)
            </Button>
          </div>
        </div>

        {/* User Summary Table */}
        {loadingUsers ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-12 bg-slate-100 dark:bg-gray-800/60 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center px-4">
            <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              No employee work logs recorded
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {debouncedSearch
                ? "No employees match your search query."
                : "No hours have been logged for this timeframe."}
            </p>
          </div>
        ) : (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Issues Worked</TableHead>
                  <TableHead>Log Entries</TableHead>
                  <TableHead>Last Logged</TableHead>
                  <TableHead className="text-right">Export</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.map((user) => {
                  const isExpanded = expandedUserIds.has(user.userId);
                  const userDetail = userDetailsCache[user.userId];
                  const initials = (user.name || "TM")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <React.Fragment key={user.userId}>
                      {/* Parent Employee Row (Clickable Accordion) */}
                      <TableRow
                        onClick={() => toggleUserAccordion(user.userId)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded
                            ? "bg-sky-50/40 dark:bg-sky-950/20"
                            : "hover:bg-slate-50/70 dark:hover:bg-gray-800/50"
                        }`}
                      >
                        {/* Accordion Chevron */}
                        <TableCell className="w-10 text-center pr-0">
                          <button
                            type="button"
                            className="p-1 rounded text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                            aria-label={isExpanded ? "Collapse row" : "Expand row"}
                          >
                            <ChevronRight
                              className={`w-4 h-4 transition-transform duration-200 ease-in-out ${
                                isExpanded
                                  ? "rotate-90 text-sky-600 dark:text-sky-400"
                                  : "text-gray-400"
                              }`}
                            />
                          </button>
                        </TableCell>

                        {/* Employee Name + Email */}
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-200/50 dark:border-sky-800">
                              {initials}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800 dark:text-gray-200 block text-xs">
                                {user.name}
                              </span>
                              {user.email && (
                                <span className="text-[10px] text-gray-400 block">
                                  {user.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Total Hours Logged */}
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/50 dark:border-sky-800/60">
                            {user.totalHours} hrs
                          </span>
                        </TableCell>

                        {/* Issues Worked Count */}
                        <TableCell>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {user.taskCount} issue{user.taskCount !== 1 ? "s" : ""}
                          </span>
                        </TableCell>

                        {/* Log Entries Count */}
                        <TableCell>
                          <span className="text-gray-500 dark:text-gray-400">
                            {user.logCount} entr{user.logCount !== 1 ? "ies" : "y"}
                          </span>
                        </TableCell>

                        {/* Last Logged Timestamp */}
                        <TableCell className="text-gray-500 dark:text-gray-400 text-[11px]">
                          {user.lastLoggedAt
                            ? new Date(user.lastLoggedAt).toLocaleDateString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </TableCell>

                        {/* Per-User Export Button */}
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            loading={exportingUserId === user.userId}
                            onClick={() => handleExportUser(user.userId, user.name)}
                            icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                            className="text-[11px] py-1 px-2.5"
                          >
                            Export
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Accordion Expandable Child: Lazy-loaded Issue List & Sub-Pagination */}
                      {isExpanded && (
                        <TableRow className="bg-slate-50/60 dark:bg-gray-950/60">
                          <TableCell colSpan={7} className="p-0">
                            <div className="py-3 px-2 sm:px-3 border-y border-sky-100/70 dark:border-gray-800/80 space-y-2.5 animate-fadeIn transition-all duration-300 ease-in-out">
                              {/* Per-User Inline Search Filter Input to enhance UX */}
                              <div className="flex justify-end">
                                <div className="w-full sm:w-60">
                                  <SearchInput
                                    value={userSearchQueries[user.userId] || ""}
                                    onChange={(val) =>
                                      handleUserSearchChange(user.userId, val)
                                    }
                                    placeholder="Filter by issue key or note..."
                                    className="w-full text-xs"
                                  />
                                </div>
                              </div>

                              {userDetail?.loading ? (
                                <div className="p-6 text-center">
                                  <span className="inline-block w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></span>
                                  <p className="text-xs text-gray-400 mt-2">
                                    Loading issue logs...
                                  </p>
                                </div>
                              ) : userDetail?.error ? (
                                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 shrink-0" />
                                  {userDetail.error}
                                </div>
                              ) : !userDetail?.logs?.length ? (
                                <div className="p-4 text-center text-xs text-gray-400 italic bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                                  No logs found for this timeframe.
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  <div className="rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-2xs">
                                    <table className="w-full text-left text-xs">
                                      <thead className="bg-slate-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                                        <tr>
                                          <th className="py-2 px-2.5">Issue</th>
                                          <th className="py-2 px-2.5">Type</th>
                                          <th className="py-2 px-2.5">Status</th>
                                          <th className="py-2 px-2.5">Hours</th>
                                          <th className="py-2 px-2.5">Description</th>
                                          <th className="py-2 px-2.5">Date</th>
                                          <th className="py-2 px-2.5 text-right">View</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {userDetail.logs.map((log) => {
                                          return (
                                            <tr
                                              key={log.workLogId}
                                              className="hover:bg-slate-50/50 dark:hover:bg-gray-800/40 transition-colors"
                                            >
                                              {/* Issue Key & Title */}
                                              <td className="py-2 px-2.5 font-medium">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    navigate(`/task/${log.taskId}`)
                                                  }
                                                  className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-bold text-left cursor-pointer"
                                                >
                                                  <span>{log.taskKey}</span>
                                                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                                                </button>
                                                <span className="text-gray-500 dark:text-gray-400 block truncate max-w-xs text-[11px] mt-0.5">
                                                  {log.taskTitle}
                                                </span>
                                              </td>

                                              {/* Issue Type */}
                                              <td className="py-2 px-2.5 text-gray-600 dark:text-gray-300 text-[11px]">
                                                {log.issueType}
                                              </td>

                                              {/* Status */}
                                              <td className="py-2 px-2.5">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                  {log.status}
                                                </span>
                                              </td>

                                              {/* Hours Spent */}
                                              <td className="py-2 px-2.5 font-bold text-gray-800 dark:text-gray-200">
                                                +{log.hoursSpent}h
                                              </td>

                                              {/* Work Description */}
                                              <td className="py-2 px-2.5 max-w-sm text-gray-600 dark:text-gray-300 text-[11px]">
                                                {log.description || (
                                                  <span className="text-gray-400 italic">
                                                    No notes provided
                                                  </span>
                                                )}
                                              </td>

                                              {/* Date */}
                                              <td className="py-2 px-2.5 text-gray-500 dark:text-gray-400 text-[11px] whitespace-nowrap">
                                                {new Date(
                                                  log.createdAt
                                                ).toLocaleDateString(undefined, {
                                                  month: "short",
                                                  day: "numeric",
                                                  year: "numeric",
                                                })}
                                              </td>

                                              {/* Open Issue Link */}
                                              <td className="py-2 px-2.5 text-right whitespace-nowrap">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    navigate(`/task/${log.taskId}`)
                                                  }
                                                  className="p-1 rounded text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                                                  title="Open issue details"
                                                >
                                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                                </button>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>

                                  {/* Sub-table Pagination for this user */}
                                  {userDetail.totalPages > 1 && (
                                    <div className="pt-1">
                                      <Pagination
                                        currentPage={userDetail.page}
                                        totalPages={userDetail.totalPages}
                                        totalItems={userDetail.totalCount}
                                        pageSize={5}
                                        itemLabel="issue logs"
                                        onPageChange={(nextPage) =>
                                          fetchUserLogs(
                                            user.userId,
                                            nextPage,
                                            userSearchQueries[user.userId]
                                          )
                                        }
                                        showItemCount={true}
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>

            {/* Master Table Pagination */}
            {totalUserPages > 1 && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <Pagination
                  currentPage={userPage}
                  totalPages={totalUserPages}
                  totalItems={totalUsersCount}
                  pageSize={10}
                  itemLabel="employees"
                  onPageChange={(nextPage) => setUserPage(nextPage)}
                  showItemCount={true}
                />
              </div>
            )}
          </div>
        )}
      </TableCard>
    </div>
  );
};
