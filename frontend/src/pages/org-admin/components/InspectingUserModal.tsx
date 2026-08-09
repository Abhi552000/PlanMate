import React from "react";
import { User, X, Calendar, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InspectingUserModalProps } from "../../../types";

export const InspectingUserModal: React.FC<InspectingUserModalProps> = ({
  inspectingUser,
  onClose,
}) => {
  const navigate = useNavigate();
  if (!inspectingUser) return null;

  const totalTasks =
    (inspectingUser.solvedTasks || 0) + (inspectingUser.pendingTasks || 0);

  return (
    <div 
      className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-sky-100 dark:border-gray-800 max-w-md w-full p-6 space-y-4 animate-scaleUp animate-duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-800 pb-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-250 text-base flex items-center gap-1.5">
            <User className="w-5 h-5 text-sky-500" /> Member Workspace Report
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Identity Profile */}
        <div className="flex items-center gap-3 bg-sky-50/20 dark:bg-sky-950/10 p-3.5 rounded-xl border border-sky-100/30 dark:border-gray-800">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
            {inspectingUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-gray-150 text-base">
              {inspectingUser.name}
            </h4>
            <span className="text-[9px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider mt-1 inline-block border border-sky-200/50 dark:border-sky-900/50">
              {inspectingUser.role === "org_admin" ? "Org Admin" : "Member"}
            </span>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
            <div className="space-y-1">
              <span className="block font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[9px]">
                Email Address
              </span>
              <span className="text-gray-700 dark:text-gray-300 truncate block">
                {inspectingUser.email}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[9px]">
                Workspace Access
              </span>
              <div>
                {inspectingUser.status === "active" ||
                inspectingUser.status === undefined ? (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                    Approved
                  </span>
                ) : inspectingUser.status === "pending" ? (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                    Pending Approval
                  </span>
                ) : (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                    Rejected / Revoked
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <span className="block font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[9px]">
                Member Since
              </span>
              <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                {inspectingUser.createdAt
                  ? new Date(inspectingUser.createdAt).toLocaleDateString()
                  : new Date("2026-08-01").toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Ticket Report Card Details */}
          <div className="border-t border-sky-50 dark:border-gray-800 pt-4 space-y-2.5">
            <span className="block font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">
              Assigned Tickets Performance Report
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => {
                  navigate(`/?assignee=${inspectingUser._id}&status=To Do`);
                  onClose();
                }}
                className="bg-sky-50/20 dark:bg-sky-950/10 border border-sky-100/50 dark:border-sky-900/30 p-2 rounded-xl text-center hover:scale-[1.03] hover:shadow-sm transition-all cursor-pointer"
              >
                <span className="block font-bold text-sky-700 dark:text-sky-400 text-sm sm:text-base">
                  {inspectingUser.todoTasks || 0}
                </span>
                <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-black">
                  To Do
                </span>
              </button>
              <button
                onClick={() => {
                  navigate(`/?assignee=${inspectingUser._id}&status=pending`);
                  onClose();
                }}
                className="bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 p-2 rounded-xl text-center hover:scale-[1.03] hover:shadow-sm transition-all cursor-pointer"
              >
                <span className="block font-bold text-amber-700 dark:text-amber-400 text-sm sm:text-base">
                  {inspectingUser.pendingTasks || 0}
                </span>
                <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-black">
                  Pending
                </span>
              </button>
              <button
                onClick={() => {
                  navigate(`/?assignee=${inspectingUser._id}&status=Done`);
                  onClose();
                }}
                className="bg-green-50/30 dark:bg-green-950/10 border border-green-100/50 dark:border-green-900/30 p-2 rounded-xl text-center hover:scale-[1.03] hover:shadow-sm transition-all cursor-pointer"
              >
                <span className="block font-bold text-green-700 dark:text-green-400 text-sm sm:text-base">
                  {inspectingUser.solvedTasks || 0}
                </span>
                <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-black">
                  Resolved
                </span>
              </button>
              <button
                onClick={() => {
                  navigate(`/?assignee=${inspectingUser._id}&status=all`);
                  onClose();
                }}
                className="bg-gray-50/50 dark:bg-gray-800/20 border border-gray-150 dark:border-gray-800 p-2 rounded-xl text-center hover:scale-[1.03] hover:shadow-sm transition-all cursor-pointer"
              >
                <span className="block font-bold text-gray-750 dark:text-gray-300 text-sm sm:text-base">
                  {totalTasks}
                </span>
                <span className="text-[8px] sm:text-[9px] text-gray-400 uppercase font-black">
                  Total
                </span>
              </button>
            </div>
          </div>

          {/* Deactivation / Status Remark Banner */}
          {inspectingUser.statusRemark && (
            <div className="bg-red-50/50 dark:bg-red-950/15 border border-red-100/70 dark:border-red-900/40 p-3.5 rounded-xl space-y-1.5 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-700 dark:text-red-400 uppercase tracking-wider text-[9px] block">
                  Status Remarks / Reason
                </span>
                <p className="text-xs text-gray-700 dark:text-gray-300 font-medium italic leading-relaxed">
                  "{inspectingUser.statusRemark}"
                </p>
              </div>
            </div>
          )}

          {/* Footer close button */}
          <div className="pt-2 border-t border-sky-50 dark:border-gray-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gray-150 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-755 text-gray-750 dark:text-gray-200 font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Close Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
