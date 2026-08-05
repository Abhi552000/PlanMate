import React from "react";
import { User, X, Calendar, ClipboardList } from "lucide-react";

interface InspectingUserModalProps {
  inspectingUser: any;
  onClose: () => void;
  currentUser: any;
  onUpdateUserStatus: (user: any, status: string) => void;
}

export const InspectingUserModal: React.FC<InspectingUserModalProps> = ({
  inspectingUser,
  onClose,
  currentUser,
  onUpdateUserStatus,
}) => {
  if (!inspectingUser) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-sky-100 dark:border-gray-800 max-w-md w-full p-6 space-y-4 animate-scaleUp">
        <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-800 pb-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base flex items-center gap-1.5">
            <User className="w-5 h-5 text-sky-500" /> Member Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-sky-50/20 p-3 rounded-xl border border-sky-100/30">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
              {inspectingUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-200 text-base">
                {inspectingUser.name}
              </h4>
              <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                {inspectingUser.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500">
            <div className="space-y-1">
              <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px]">
                Email Address
              </span>
              <span className="text-gray-700 dark:text-gray-300 truncate block">
                {inspectingUser.email}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px]">
                Workspace Access
              </span>
              <div>
                {inspectingUser.status === "active" ? (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                    Approved
                  </span>
                ) : inspectingUser.status === "pending" ? (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                    Pending
                  </span>
                ) : (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                    Rejected
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px]">
                Member Since
              </span>
              <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                {inspectingUser.createdAt
                  ? new Date(inspectingUser.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px]">
                Tickets Resolved
              </span>
              <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1 font-bold">
                <ClipboardList className="w-3.5 h-3.5 text-sky-400" />
                {inspectingUser.solvedTasks || 0} Tasks
              </span>
            </div>
          </div>

          {/* Approval controls inside details modal */}
          {inspectingUser.email !== currentUser?.email && (
            <div className="pt-4 border-t border-sky-50 dark:border-gray-800 flex items-center justify-end gap-2">
              {inspectingUser.status === "pending" && (
                <>
                  <button
                    onClick={() => onUpdateUserStatus(inspectingUser, "rejected")}
                    className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg text-xs transition-colors cursor-pointer bg-white dark:bg-gray-900"
                  >
                    Reject Access
                  </button>
                  <button
                    onClick={() => onUpdateUserStatus(inspectingUser, "active")}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    Approve Access
                  </button>
                </>
              )}

              {inspectingUser.status === "active" && (
                <button
                  onClick={() => onUpdateUserStatus(inspectingUser, "rejected")}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  Revoke Workspace Access
                </button>
              )}

              {inspectingUser.status === "rejected" && (
                <button
                  onClick={() => onUpdateUserStatus(inspectingUser, "active")}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  Restore Access
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
