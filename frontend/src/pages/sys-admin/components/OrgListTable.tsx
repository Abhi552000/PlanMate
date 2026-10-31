import React, { useState, useMemo, useEffect } from "react";
import {
  Building,
  Search,
  Power,
  Edit,
  Trash2,
  X,
  KeyRound,
  Eye,
  Download,
  Users,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { OrgListTableProps } from "../../../types";

export const OrgListTable: React.FC<OrgListTableProps> = ({
  organizations,
  searchQuery,
  setSearchQuery,
  togglingStatus,
  onToggleActive,
  onEditClick,
  onDeleteClick,
  onResetPasswordClick,
  onInspectClick,
  onExportCSV,
}) => {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      // 1. Status Filter
      if (statusFilter === "active" && !org.isActive) return false;
      if (statusFilter === "inactive" && org.isActive) return false;

      // 2. Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        org.name.toLowerCase().includes(q) ||
        (org.admin?.name && org.admin.name.toLowerCase().includes(q)) ||
        (org.admin?.email && org.admin.email.toLowerCase().includes(q)) ||
        (org.slug && org.slug.toLowerCase().includes(q))
      );
    });
  }, [organizations, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredOrgs.length / itemsPerPage));
  const paginatedOrgs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrgs.slice(start, start + itemsPerPage);
  }, [filteredOrgs, currentPage, itemsPerPage]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
      {/* TOOLBAR MATCHING OTHER TABLES AND FILTERS */}
      <div className="p-4 sm:p-5 border-b border-sky-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-gray-50/50 dark:bg-gray-900/50">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Building className="w-4.5 h-4.5 text-sky-500" />
            Organizations Directory
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Manage organization instances, representatives, and access
          </p>
        </div>

        {/* FILTERS & EXPORT TOOLBAR */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-[38px] px-3 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-2xs"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Search Input */}
          <div className="relative min-w-[190px] sm:min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[38px] w-full pl-9 pr-8 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-sky-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Export CSV Button */}
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="h-[38px] px-3 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Export Organizations Directory to CSV"
            >
              <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/70 dark:bg-gray-950/40">
              <th className="px-5 py-3.5">Organization</th>
              <th className="px-5 py-3.5">Admin Representative</th>
              <th className="px-5 py-3.5">Subscription Plan</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Created</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-sm">
            {paginatedOrgs.map((org) => (
              <tr
                key={org._id}
                className={`hover:bg-sky-50/30 dark:hover:bg-gray-800/30 transition-colors ${
                  !org.isActive ? "bg-red-50/[0.04]" : ""
                }`}
              >
                {/* Org Name (clickable to inspect) */}
                <td className="px-5 py-3.5">
                  <div
                    onClick={() => onInspectClick?.(org)}
                    className="flex items-center gap-2.5 cursor-pointer group"
                    title="Click to view tenant details"
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex items-center justify-center font-bold text-xs text-sky-600 dark:text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
                      {org.name?.[0]?.toUpperCase() || "O"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {org.name}
                      </p>
                      {org.slug && (
                        <p className="text-[10px] text-gray-400 font-medium">/{org.slug}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Admin Representative */}
                <td className="px-5 py-3.5">
                  <p className="font-medium text-gray-800 dark:text-gray-200 text-sm leading-tight">
                    {org.admin?.name || "Unassigned"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                    {org.admin?.email || "—"}
                  </p>
                </td>

                {/* Subscription Plan */}
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800">
                    {org.subscription?.planName || "Starter"}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="px-5 py-3.5">
                  {org.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 self-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Inactive
                      </span>
                      {org.remark && (
                        <span
                          className="text-[10px] text-rose-600 dark:text-rose-400 italic truncate max-w-[150px] mt-0.5"
                          title={org.remark}
                        >
                          {org.remark}
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* Created Date */}
                <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {org.createdAt
                    ? new Date(org.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </td>

                {/* Action Controls */}
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* 1-Click Reset Password Key */}
                    {onResetPasswordClick && (
                      <button
                        onClick={() => onResetPasswordClick(org)}
                        className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg transition-colors border border-transparent hover:border-amber-200 cursor-pointer"
                        title="Reset Admin Credentials"
                        aria-label="Reset Admin Credentials"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                    )}

                    {/* Inspect Drawer Button */}
                    {onInspectClick && (
                      <button
                        onClick={() => onInspectClick(org)}
                        className="p-1.5 text-gray-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded-lg transition-colors border border-transparent hover:border-sky-200 cursor-pointer"
                        title="Inspect Workspace Overview"
                        aria-label="Inspect Workspace Overview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    {/* Power Toggle */}
                    <button
                      onClick={() => onToggleActive(org)}
                      disabled={togglingStatus}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                        org.isActive
                          ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-transparent hover:border-rose-200"
                          : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-transparent hover:border-emerald-200"
                      }`}
                      title={org.isActive ? "Deactivate Organization" : "Activate Organization"}
                      aria-label={org.isActive ? "Deactivate Organization" : "Activate Organization"}
                    >
                      <Power className="w-4 h-4" />
                    </button>

                    {/* Edit Details */}
                    <button
                      onClick={() => onEditClick(org)}
                      className="p-1.5 text-gray-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded-lg transition-colors border border-transparent hover:border-sky-200 cursor-pointer"
                      title="Edit Details"
                      aria-label="Edit Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete Org */}
                    <button
                      onClick={() => onDeleteClick(org)}
                      className="p-1.5 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                      title="Delete Instance"
                      aria-label="Delete Instance"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredOrgs.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-16 text-xs text-gray-400 dark:text-gray-500 font-semibold bg-gray-50/20 dark:bg-gray-950/20"
                >
                  No organizations found matching search criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      {filteredOrgs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-sky-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/20 text-xs">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredOrgs.length)} of{" "}
              {filteredOrgs.length} organizations
            </span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="text-gray-500 dark:text-gray-400">Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 px-2 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-2xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-semibold hover:bg-sky-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg border text-xs font-bold flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${
                  currentPage === pageNum
                    ? "bg-sky-500 border-sky-500 text-white"
                    : "border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-800"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-semibold hover:bg-sky-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
