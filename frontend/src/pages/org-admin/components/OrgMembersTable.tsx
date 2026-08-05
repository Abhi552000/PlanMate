import React from "react";
import { Users, Eye, Check, X, Power, RotateCcw } from "lucide-react";

interface OrgMembersTableProps {
  teamUsers: any[];
  currentUser: any;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  togglingStatus: boolean;
  onPageChange: (page: number) => void;
  onInspectUser: (user: any) => void;
  onUpdateUserStatus: (user: any, status: string) => void;
}

const ITEMS_PER_PAGE = 5;

export const OrgMembersTable: React.FC<OrgMembersTableProps> = ({
  teamUsers,
  currentUser,
  currentPage,
  totalPages,
  totalCount,
  togglingStatus,
  onPageChange,
  onInspectUser,
  onUpdateUserStatus,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-sky-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Users className="w-4.5 h-4.5 text-sky-500" /> User Access & Approval Management
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-sky-50/70 dark:border-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-300 uppercase bg-gray-50/30 dark:bg-gray-950/20">
              <th className="px-6 py-4">User Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Solved Tickets</th>
              <th className="px-6 py-4">Access Status</th>
              <th className="px-6 py-4 text-right">Approval Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50/45 dark:divide-gray-800 text-sm">
            {teamUsers.map((member) => (
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
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onInspectUser(member)}
                      className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100 cursor-pointer"
                      title="View Full Profile Details"
                    >
                      <Eye className="w-4.5 h-4.5" />
                    </button>

                    {/* Don't let users edit their own status */}
                    {member.email !== currentUser?.email && (
                      <>
                        {member.status === "pending" && (
                          <>
                            <button
                              onClick={() => onUpdateUserStatus(member, "active")}
                              disabled={togglingStatus}
                              className="p-1 text-green-600 hover:bg-green-50 rounded border border-transparent hover:border-green-200 transition-colors cursor-pointer"
                              title="Approve Access Request"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onUpdateUserStatus(member, "rejected")}
                              disabled={togglingStatus}
                              className="p-1 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                              title="Reject Access Request"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {member.status === "active" && (
                          <button
                            onClick={() => onUpdateUserStatus(member, "rejected")}
                            disabled={togglingStatus}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                            title="Revoke / Deactivate Access"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}

                        {member.status === "rejected" && (
                          <button
                            onClick={() => onUpdateUserStatus(member, "active")}
                            disabled={togglingStatus}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-100 transition-colors cursor-pointer"
                            title="Restore Access"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
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
