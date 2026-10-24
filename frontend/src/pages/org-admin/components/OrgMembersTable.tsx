import React, { useState, useEffect, useRef } from "react";
import { Users, Eye, Power, RotateCcw, MoreVertical, Search, Filter, X } from "lucide-react";
import { OrgMembersTableProps } from "../../../types";

const ITEMS_PER_PAGE = 5;

export const OrgMembersTable: React.FC<OrgMembersTableProps> = ({
  teamUsers,
  currentUser,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  onInspectUser,
  onUpdateUserStatusClick,
  selectedStatus,
  onStatusChange,
  selectedRole,
  onRoleChange,
  searchQuery,
  onSearchChange,
  onResetFilters,
}) => {
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveMenuUserId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const hasActiveFilters = selectedStatus !== "all" || selectedRole !== "all" || Boolean(searchQuery);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm overflow-visible">
      {/* Table Header with Integrated Backend Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-sky-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-sky-500" /> User Access & Approval Management
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Manage member credentials, assign roles, and approve workspace access
          </p>
        </div>

        {/* Backend Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[190px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-8 pl-8.5 pr-3 text-xs bg-white dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-lg text-gray-750 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            />
          </div>

          {/* Role Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="h-8 px-3 text-xs font-semibold bg-white dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-lg text-gray-750 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="org_admin">Org Admin</option>
              <option value="member">Member</option>
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="h-8 px-3 text-xs font-semibold bg-white dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-lg text-gray-750 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Approved (Active)</option>
              <option value="pending">Pending Approval</option>
              <option value="rejected">Access Rejected</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="h-8 px-2.5 text-xs font-bold text-gray-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-1 cursor-pointer"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-visible min-h-[250px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-sky-50/70 dark:border-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-300 uppercase bg-gray-50/30 dark:bg-gray-950/20">
              <th className="px-6 py-4">User Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Solved Tickets</th>
              <th className="px-6 py-4">Access Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50/45 dark:divide-gray-800 text-sm overflow-y-visible">
            {teamUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-14 text-gray-400 dark:text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="w-8 h-8 text-gray-300 dark:text-gray-650" />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      No members found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              teamUsers.map((member) => (
              <tr
                key={member._id}
                className={`hover:bg-sky-50/20 transition-all ${
                  member.status === "pending"
                    ? "bg-amber-50/[0.08]"
                    : member.status === "rejected"
                    ? "bg-red-50/[0.04]"
                    : ""
                }`}
              >
                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{member.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-gray-500 text-xs dark:text-gray-400">
                  {member.email}
                </td>
                <td className="px-6 py-4">
                  {member.role === "org_admin" ? (
                    <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wide">
                      Org Admin
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200 uppercase tracking-wide">
                      Member
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-gray-700 dark:text-gray-300 font-bold">
                  {member.solvedTasks || 0} Solved
                </td>
                <td className="px-6 py-4">
                  {member.status === "active" || member.status === undefined ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                      Approved
                    </span>
                  ) : member.status === "pending" ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                      Pending Approval
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                      Access Rejected
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right overflow-visible relative">
                  <div className="flex items-center justify-end relative">
                    <button
                      onClick={() => setActiveMenuUserId(activeMenuUserId === member._id ? null : member._id)}
                      className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100 cursor-pointer"
                      title="Actions Menu"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Popover actions menu */}
                    {activeMenuUserId === member._id && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 top-10 z-30 w-48 bg-white dark:bg-gray-800 border border-sky-100 dark:border-gray-700 rounded-xl shadow-xl py-1.5 text-left animate-fadeIn"
                      >
                        <button
                          onClick={() => {
                            setActiveMenuUserId(null);
                            onInspectUser(member);
                          }}
                          className="w-full px-4 py-2 text-xs font-bold text-gray-750 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-500" /> View Details
                        </button>

                        {member.email !== currentUser?.email && (
                          <>
                            {(member.status === "active" || member.status === undefined) ? (
                              <button
                                onClick={() => {
                                  setActiveMenuUserId(null);
                                  onUpdateUserStatusClick(member, "deactivate");
                                }}
                                className="w-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2 cursor-pointer border-t border-sky-50 dark:border-gray-700"
                              >
                                <Power className="w-3.5 h-3.5" /> Deactivate Access
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setActiveMenuUserId(null);
                                  onUpdateUserStatusClick(member, "activate");
                                }}
                                className="w-full px-4 py-2 text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 flex items-center gap-2 cursor-pointer border-t border-sky-50 dark:border-gray-700"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Grant/Restore Access
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalCount > ITEMS_PER_PAGE && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-sky-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-950/20 text-xs">
          <span className="font-semibold text-gray-500 dark:text-gray-400">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
            {totalCount} users
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-3 py-1.5 rounded-lg border border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-650 dark:text-gray-300 font-bold hover:bg-sky-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-lg border font-bold flex items-center justify-center transition-colors cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-sky-500 border-sky-500 text-white shadow-sm"
                    : "border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-650 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-800"
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-3 py-1.5 rounded-lg border border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-650 dark:text-gray-300 font-bold hover:bg-sky-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
