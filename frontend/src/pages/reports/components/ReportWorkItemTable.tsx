import React, { useState, useMemo } from "react";
import {
  Download,
  Search,
  Bug,
  BookOpen,
  Award,
  CheckSquare,
  ArrowUp,
  Minus,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import { ITask, ReportWorkItemTableProps } from "../../../types";
import { getPriorityStyle } from "../../../utils";
import {
  FilterSelect,
  SearchInput,
  Pagination,
  TableCard,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableEmpty,
} from "../../../components/ui";
import { REPORT_TABLE_TEXTS } from "../../../constants/uiTexts";

export const ReportWorkItemTable: React.FC<ReportWorkItemTableProps> = ({
  tasks,
  loading = false,
  onSelectTask,
}) => {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const typeOptions = useMemo(() => [
    { label: "All Types", value: "all" },
    { label: "Task", value: "Task" },
    { label: "Bug", value: "Bug" },
    { label: "Story", value: "Story" },
    { label: "Epic", value: "Epic" },
  ], []);

  const priorityOptions = useMemo(() => [
    { label: "All Priorities", value: "all" },
    { label: "High", value: "High" },
    { label: "Medium", value: "Medium" },
    { label: "Low", value: "Low" },
  ], []);

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
    <TableCard>
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {REPORT_TABLE_TEXTS.TITLE}
          </h3>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
            placeholder="Filter summary or key..."
            className="w-44 sm:w-56"
          />

          {/* Type Filter */}
          <FilterSelect
            label="Type"
            value={selectedType}
            options={typeOptions}
            onChange={(val) => {
              setSelectedType(val);
              setCurrentPage(1);
            }}
          />

          {/* Priority Filter */}
          <FilterSelect
            label="Priority"
            value={selectedPriority}
            options={priorityOptions}
            onChange={(val) => {
              setSelectedPriority(val);
              setCurrentPage(1);
            }}
          />

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
            title="Export report to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{REPORT_TABLE_TEXTS.BTN_EXPORT_CSV}</span>
          </button>
        </div>
      </div>

      {/* Table Data */}
      <Table>
        <TableHeader>
          <tr>
            <TableHead>{REPORT_TABLE_TEXTS.COL_KEY}</TableHead>
            <TableHead>{REPORT_TABLE_TEXTS.COL_TYPE}</TableHead>
            <TableHead>{REPORT_TABLE_TEXTS.COL_PRIORITY}</TableHead>
            <TableHead>{REPORT_TABLE_TEXTS.COL_SUMMARY}</TableHead>
            <TableHead>{REPORT_TABLE_TEXTS.COL_STATUS}</TableHead>
            <TableHead>{REPORT_TABLE_TEXTS.COL_ASSIGNEE}</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {loading && paginatedTasks.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 sm:px-5 py-3.5"><div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800" /></td>
                <td className="px-3 sm:px-5 py-3.5"><div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" /></td>
                <td className="px-3 sm:px-5 py-3.5"><div className="h-4 w-16 rounded-full bg-slate-200 dark:bg-slate-800" /></td>
                <td className="px-3 sm:px-5 py-3.5"><div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-800" /></td>
                <td className="px-3 sm:px-5 py-3.5"><div className="h-4 w-20 rounded-md bg-slate-200 dark:bg-slate-800" /></td>
                <td className="px-3 sm:px-5 py-3.5"><div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" /></td>
              </tr>
            ))
          ) : paginatedTasks.length === 0 ? (
            <TableEmpty
              colSpan={6}
              message={REPORT_TABLE_TEXTS.EMPTY_REPORTS}
            />
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
          </TableBody>
        </Table>

      {/* Pagination Footer */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        itemLabel="items"
        onPageChange={setCurrentPage}
      />
    </TableCard>
  );
};
