import React, { useState, useMemo } from "react";
import {
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Bug,
  BookOpen,
  Award,
  CheckSquare,
  ArrowUp,
  Minus,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import { ITask } from "../../../types";
import { getPriorityStyle } from "../../../utils";

interface ReportWorkItemTableProps {
  tasks: ITask[];
  onSelectTask?: (task: ITask) => void;
}

export const ReportWorkItemTable: React.FC<ReportWorkItemTableProps> = ({
  tasks,
  onSelectTask,
}) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        search === "" ||
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        (t.key && t.key.toLowerCase().includes(search.toLowerCase())) ||
        (t._id && t._id.toLowerCase().includes(search.toLowerCase()));

      const matchType =
        selectedType === "all" ||
        (t.issueType || "Task").toLowerCase() === selectedType.toLowerCase();

      const matchPriority =
        selectedPriority === "all" ||
        (t.priority || "Low").toLowerCase() === selectedPriority.toLowerCase();

      const matchStatus =
        selectedStatus === "all" ||
        (t.status || "To Do").toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchType && matchPriority && matchStatus;
    });
  }, [tasks, search, selectedType, selectedPriority, selectedStatus]);

  // Pagination
  const totalItems = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTasks.slice(start, start + pageSize);
  }, [filteredTasks, currentPage, pageSize]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ["Work item key", "Work type", "Work item priority", "Status", "Assignee", "Issue summary"];
    const rows = filteredTasks.map((t) => {
      const key = t.key || (t._id ? `PM-${t._id.slice(-4).toUpperCase()}` : "TASK");
      const type = t.issueType || "Task";
      const priority = t.priority || "Low";
      const status = t.status || (t.completed ? "Done" : "To Do");
      const assignee =
        typeof t.assignee === "object" && t.assignee?.name
          ? t.assignee.name
          : "Unassigned";
      const summary = `"${(t.title || "").replace(/"/g, '""')}"`;
      return [key, type, priority, status, assignee, summary].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `planmate_work_items_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWorkTypeIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "bug":
        return <Bug className="w-4 h-4 text-rose-500 fill-rose-500/20 shrink-0" />;
      case "story":
        return <BookOpen className="w-4 h-4 text-emerald-500 fill-emerald-500/20 shrink-0" />;
      case "epic":
        return <Award className="w-4 h-4 text-purple-500 fill-purple-500/20 shrink-0" />;
      default:
        return <CheckSquare className="w-4 h-4 text-sky-500 fill-sky-500/20 shrink-0" />;
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <ArrowUp className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case "medium":
        return <Minus className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      default:
        return <ArrowDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Work item details
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Tabular list of work items with status, type, and priority
          </p>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter summary or key..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-sky-500 w-44 sm:w-52"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-gray-50 dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="Task">Task</option>
            <option value="Bug">Bug</option>
            <option value="Story">Story</option>
            <option value="Epic">Epic</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-gray-50 dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-lg px-2.5 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
            title="Export report to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50/75 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider text-[11px] border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="py-3 px-4">Work item key</th>
              <th className="py-3 px-4">Work type</th>
              <th className="py-3 px-4">Work item priority</th>
              <th className="py-3 px-4">Issue summary</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assignee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {paginatedTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  No work items match your report filter criteria
                </td>
              </tr>
            ) : (
              paginatedTasks.map((t) => {
                const key = t.key || (t._id ? `PM-${t._id.slice(-4).toUpperCase()}` : "TASK");
                const type = t.issueType || "Task";
                const priority = t.priority || "Low";
                const status = t.status || (t.completed ? "Done" : "To Do");
                const assigneeName =
                  typeof t.assignee === "object" && t.assignee?.name
                    ? t.assignee.name
                    : "Unassigned";

                return (
                  <tr
                    key={t._id}
                    onClick={() => onSelectTask?.(t)}
                    className="hover:bg-sky-50/40 dark:hover:bg-gray-800/40 cursor-pointer transition-colors group"
                  >
                    {/* Work item key */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-sky-600 dark:text-sky-400 group-hover:underline flex items-center gap-1">
                        {key}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </td>

                    {/* Work type */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                        {getWorkTypeIcon(type)}
                        <span>{type}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium">
                        {getPriorityIcon(priority)}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase ${getPriorityStyle(priority)}`}>
                          {priority}
                        </span>
                      </div>
                    </td>

                    {/* Issue Summary */}
                    <td className="py-3 px-4 max-w-md">
                      <p className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {t.title}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                        {status}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="py-3 px-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {assigneeName}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Matching Screenshot 1) */}
      <div className="p-3.5 sm:p-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-md font-bold text-xs transition-colors ${
                  isActive
                    ? "bg-sky-500 text-white"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          {totalPages > 5 && <span className="px-1 text-gray-400">...</span>}
          {totalPages > 5 && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              className={`w-7 h-7 rounded-md font-bold text-xs transition-colors ${
                totalPages === currentPage
                  ? "bg-sky-500 text-white"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {totalPages}
            </button>
          )}

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div>
          Showing {totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
          {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
        </div>
      </div>
    </div>
  );
};
