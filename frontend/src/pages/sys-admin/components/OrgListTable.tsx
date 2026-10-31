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
import { ORG_TABLE_TEXTS } from "../../../constants/billingTexts";

export const OrgListTable: React.FC<OrgListTableProps> = ({
  organizations,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  tableLoading,
  togglingStatus,
  onToggleActive,
  onEditClick,
  onDeleteClick,
  onResetPasswordClick,
  onInspectClick,
  onExportCSV,
}) => {

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-gray-800 shadow-sm overflow-hidden transition-colors">
      {/* TOOLBAR MATCHING OTHER TABLES AND FILTERS */}
      <div className="p-4 sm:p-5 border-b border-sky-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-gray-50/50 dark:bg-gray-900/50">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Building className="w-4.5 h-4.5 text-sky-500" />
            {ORG_TABLE_TEXTS.DIRECTORY_TITLE}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {ORG_TABLE_TEXTS.DIRECTORY_SUBTITLE}
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
            <option value="all">{ORG_TABLE_TEXTS.FILTER_ALL_STATUS}</option>
            <option value="active">{ORG_TABLE_TEXTS.FILTER_ACTIVE}</option>
            <option value="inactive">{ORG_TABLE_TEXTS.FILTER_INACTIVE}</option>
          </select>

          {/* Search Input */}
          <div className="relative min-w-[190px] sm:min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={ORG_TABLE_TEXTS.SEARCH_PLACEHOLDER}
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
              title={ORG_TABLE_TEXTS.BTN_EXPORT_CSV}
            >
              <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline">{ORG_TABLE_TEXTS.BTN_EXPORT_CSV}</span>
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50/70 dark:bg-gray-950/40">
              <th className="px-5 py-3.5">{ORG_TABLE_TEXTS.COL_ORGANIZATION}</th>
              <th className="px-5 py-3.5">{ORG_TABLE_TEXTS.COL_ADMIN}</th>
              <th className="px-5 py-3.5">{ORG_TABLE_TEXTS.COL_PLAN}</th>
              <th className="px-5 py-3.5">{ORG_TABLE_TEXTS.COL_PLAN_TYPE}</th>
              <th className="px-5 py-3.5">{ORG_TABLE_TEXTS.COL_STATUS}</th>
              <th className="px-5 py-3.5">{ORG_TABLE_TEXTS.COL_CREATED}</th>
              <th className="px-5 py-3.5 text-right">{ORG_TABLE_TEXTS.COL_ACTIONS}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-sm">
            {tableLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-3 w-16 rounded bg-slate-100 dark:bg-slate-800/60" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1.5">
                      <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
                      <div className="h-3 w-36 rounded bg-slate-100 dark:bg-slate-800/60" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-20 rounded bg-slate-100 dark:bg-slate-800/60" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="h-7 w-24 rounded-lg bg-slate-200 dark:bg-slate-800 ml-auto" />
                  </td>
                </tr>
              ))
            ) : (
              organizations.map((org) => (
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
                    title={ORG_TABLE_TEXTS.TOOLTIP_INSPECT}
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
                    {org.admin?.name || ORG_TABLE_TEXTS.UNASSIGNED}
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

                {/* Plan Type (Billing Cycle: Monthly / Yearly) */}
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize border border-gray-200/80 dark:border-gray-700">
                    {org.subscription?.billingCycle || "Monthly"}
                  </span>
                </td>

                {/* Status Badge */}
                <td className="px-5 py-3.5">
                  {org.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {ORG_TABLE_TEXTS.BADGE_ACTIVE}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 self-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {ORG_TABLE_TEXTS.BADGE_INACTIVE}
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
                    {/* 1-Click Reset Password Key with project sky color */}
                    {onResetPasswordClick && (
                      <button
                        onClick={() => onResetPasswordClick(org)}
                        className="p-1.5 text-sky-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30 rounded-lg transition-colors border border-transparent hover:border-sky-200 cursor-pointer"
                        title={ORG_TABLE_TEXTS.TOOLTIP_RESET_PASSWORD}
                        aria-label={ORG_TABLE_TEXTS.TOOLTIP_RESET_PASSWORD}
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
            )))
          }

            {!tableLoading && organizations.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-16 text-xs text-gray-400 dark:text-gray-500 font-semibold bg-gray-50/20 dark:bg-gray-950/20"
                >
                  {ORG_TABLE_TEXTS.EMPTY_MATCH_SUBTITLE}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-sky-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/20 text-xs">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span>
              Showing <span className="font-bold text-gray-800 dark:text-gray-200">{(currentPage - 1) * 10 + 1}</span> to{" "}
              <span className="font-bold text-gray-800 dark:text-gray-200">{Math.min(currentPage * 10, totalCount)}</span> of{" "}
              <span className="font-bold text-gray-800 dark:text-gray-200">{totalCount}</span> organizations (Page {currentPage} of {totalPages})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1 || tableLoading}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-semibold hover:bg-sky-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                disabled={tableLoading}
                onClick={() => onPageChange(pageNum)}
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
              disabled={currentPage >= totalPages || tableLoading}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
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
