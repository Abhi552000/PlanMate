import React, { useState, useEffect, useRef } from "react";
import { Users, Eye, Power, RotateCcw, MoreVertical, Search, Filter, X } from "lucide-react";
import { OrgMembersTableProps } from "../../../types";
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
import { ORG_MEMBERS_TEXTS } from "../../../constants/uiTexts";

const ITEMS_PER_PAGE = 5;

const ROLE_OPTIONS = [
  { label: ORG_MEMBERS_TEXTS.FILTER_ALL_ROLES, value: "all" },
  { label: ORG_MEMBERS_TEXTS.FILTER_ORG_ADMIN, value: "org_admin" },
  { label: ORG_MEMBERS_TEXTS.FILTER_MEMBER, value: "member" },
];

const STATUS_OPTIONS = [
  { label: ORG_MEMBERS_TEXTS.FILTER_ALL_STATUSES, value: "all" },
  { label: ORG_MEMBERS_TEXTS.FILTER_ACTIVE, value: "active" },
  { label: ORG_MEMBERS_TEXTS.FILTER_PENDING, value: "pending" },
  { label: ORG_MEMBERS_TEXTS.FILTER_REJECTED, value: "rejected" },
];

export const OrgMembersTable: React.FC<OrgMembersTableProps> = ({
  teamUsers,
  currentUser,
  currentPage,
  totalPages,
  totalCount,
  tableLoading = false,
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
    <TableCard className="border-sky-100/50 dark:border-gray-800 shadow-sm overflow-visible">
      {/* Table Header with Integrated Backend Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-sky-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-sky-500" /> Team Members
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Manage workspace members, assign roles, and control access
          </p>
        </div>

        {/* Backend Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search by name or email..."
            className="min-w-[200px] flex-1 sm:flex-initial"
          />

          {/* Role Filter Dropdown */}
          <FilterSelect
            label="Role"
            value={selectedRole}
            options={ROLE_OPTIONS}
            onChange={onRoleChange}
          />

          {/* Status Filter Dropdown */}
          <FilterSelect
            label="Status"
            value={selectedStatus}
            options={STATUS_OPTIONS}
            onChange={onStatusChange}
          />

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="h-[38px] px-3 text-xs font-bold text-gray-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-sky-100 dark:hover:border-gray-700"
              title="Reset all filters"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      <Table wrapperClassName="overflow-y-visible min-h-[250px]">
        <TableHeader>
          <tr>
            <TableHead>{ORG_MEMBERS_TEXTS.COL_NAME}</TableHead>
            <TableHead className="hidden sm:table-cell">{ORG_MEMBERS_TEXTS.COL_EMAIL}</TableHead>
            <TableHead>{ORG_MEMBERS_TEXTS.COL_ROLE}</TableHead>
            <TableHead className="hidden md:table-cell">{ORG_MEMBERS_TEXTS.COL_SOLVED}</TableHead>
            <TableHead>{ORG_MEMBERS_TEXTS.COL_STATUS}</TableHead>
            <TableHead className="text-right">{ORG_MEMBERS_TEXTS.COL_ACTIONS}</TableHead>
          </tr>
        </TableHeader>
        <TableBody className="overflow-y-visible">
          {tableLoading && teamUsers.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-gray-800">
                <td className="px-3 sm:px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                  <div className="h-3.5 w-36 bg-slate-100 dark:bg-slate-800/60 rounded" />
                </td>
                <td className="px-3 sm:px-6 py-4">
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                </td>
                <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                  <div className="h-3.5 w-14 bg-slate-100 dark:bg-slate-800/60 rounded" />
                </td>
                <td className="px-3 sm:px-6 py-4">
                  <div className="h-5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
                </td>
                <td className="px-3 sm:px-6 py-4 text-right">
                  <div className="h-7 w-7 bg-slate-200 dark:bg-slate-800 rounded-lg ml-auto" />
                </td>
              </tr>
            ))
          ) : teamUsers.length === 0 ? (
            <TableEmpty
              colSpan={6}
              message={ORG_MEMBERS_TEXTS.EMPTY_MEMBERS}
              icon={<Users className="w-8 h-8 text-gray-300 dark:text-gray-600" />}
            />
          ) : (
              teamUsers.map((member) => (
              <tr
                key={member._id}
                className={`hover:bg-sky-50/20 transition-all whitespace-nowrap ${
                  member.status === "pending"
                    ? "bg-amber-50/[0.08]"
                    : member.status === "rejected"
                    ? "bg-red-50/[0.04]"
                    : ""
                }`}
              >
                <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-gray-800 dark:text-gray-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-[11px] sm:text-xs shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate max-w-[140px] sm:max-w-none">{member.name}</span>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 font-semibold text-gray-500 text-[11px] sm:text-xs dark:text-gray-400 hidden sm:table-cell">
                  {member.email}
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
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
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-[11px] sm:text-xs text-gray-700 dark:text-gray-300 font-bold hidden md:table-cell">
                  {member.solvedTasks || 0} Solved
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4">
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
                <td className="px-3 sm:px-6 py-3 sm:py-4 text-right overflow-visible relative">
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
          </TableBody>
        </Table>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={ITEMS_PER_PAGE}
        itemLabel="users"
        onPageChange={onPageChange}
      />
    </TableCard>
  );
};
