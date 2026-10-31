import React from "react";
import {
  X,
  Building,
  Users,
  CheckCircle2,
  XCircle,
  KeyRound,
  Edit,
  Power,
  Trash2,
  Mail,
  Calendar,
  Layers,
  Copy,
  Check,
  CreditCard,
} from "lucide-react";
import { IOrganization } from "../../../types";

interface TenantDetailDrawerProps {
  org: IOrganization | null;
  onClose: () => void;
  onResetPassword: (org: any) => void;
  onEdit: (org: any) => void;
  onToggleActive: (org: any) => void;
  onDelete: (org: any) => void;
}

export const TenantDetailDrawer: React.FC<TenantDetailDrawerProps> = ({
  org,
  onClose,
  onResetPassword,
  onEdit,
  onToggleActive,
  onDelete,
}) => {
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  if (!org) return null;

  const handleCopyEmail = () => {
    if (!org.admin?.email) return;
    navigator.clipboard.writeText(org.admin.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const statuses = Array.isArray(org.statuses) && org.statuses.length > 0
    ? org.statuses
    : ["To Do", "In Progress", "Done", "Reopen"];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-gray-900 shadow-2xl border-l border-sky-100 dark:border-gray-800 flex flex-col justify-between overflow-y-auto animate-slideInRight">
          {/* Top Header */}
          <div className="p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex items-center justify-center font-black text-base text-sky-600 dark:text-sky-400 shrink-0">
                  {org.name?.[0]?.toUpperCase() || "O"}
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                    {org.name}
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                    ID: {org._id}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Pill & Created Date */}
            <div className="flex items-center gap-2 mt-4">
              {org.isActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Workspace
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Deactivated
                </span>
              )}
              {org.createdAt && (
                <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 ml-auto">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(org.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-5 space-y-6 flex-1 overflow-y-auto">
            {/* KPI Resource Utilization Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                Resource Utilization & Plan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-sky-100 dark:border-gray-800 bg-sky-50/30 dark:bg-gray-950/40">
                  <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-medium">Team Size</span>
                  </div>
                  <p className="text-xl font-black text-gray-900 dark:text-gray-100">
                    {org.memberCount !== undefined ? org.memberCount : "—"}
                  </p>
                  <span className="text-[10px] text-gray-400 font-medium">Active members</span>
                </div>

                <div className="p-3.5 rounded-xl border border-sky-100 dark:border-gray-800 bg-sky-50/30 dark:bg-gray-950/40">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                    <Layers className="w-4 h-4" />
                    <span className="text-xs font-medium">Total Work Items</span>
                  </div>
                  <p className="text-xl font-black text-gray-900 dark:text-gray-100">
                    {org.taskCount !== undefined ? org.taskCount : org.taskCounter || 0}
                  </p>
                  <span className="text-[10px] text-gray-400 font-medium">Lifetime tickets</span>
                </div>

                <div className="p-3.5 rounded-xl border border-sky-100 dark:border-gray-800 bg-sky-50/30 dark:bg-gray-950/40">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                    <CreditCard className="w-4 h-4" />
                    <span className="text-xs font-medium">Subscription</span>
                  </div>
                  <p className="text-sm font-black text-gray-900 dark:text-gray-100 truncate">
                    {org.subscription?.planName || "Starter"}
                  </p>
                  <span className="text-[10px] text-gray-400 font-medium">
                    Max {org.subscription?.maxMembers || 5} seats
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Representative Details */}
            <div className="p-4 rounded-xl border border-sky-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Tenant Administrator
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                    {org.admin?.name || "Unassigned"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                    {org.admin?.email || "No email registered"}
                  </p>
                </div>
                {org.admin?.email && (
                  <button
                    onClick={handleCopyEmail}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-700 text-gray-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    title="Copy email"
                  >
                    {copiedEmail ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Configured Workflow Statuses */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2.5">
                Board Workflow Columns ({statuses.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {statuses.map((statusName, idx) => (
                  <span
                    key={statusName}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    {statusName}
                  </span>
                ))}
              </div>
            </div>

            {/* Deactivation Reason if inactive */}
            {!org.isActive && org.remark && (
              <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-xs text-rose-800 dark:text-rose-300">
                <span className="font-bold block mb-1">Deactivation Note:</span>
                <p className="italic">{org.remark}</p>
              </div>
            )}
          </div>

          {/* Quick Actions Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/80 space-y-2">
            <button
              onClick={() => {
                onResetPassword(org);
              }}
              className="w-full py-2 px-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <KeyRound className="w-4 h-4" />
              Reset Admin Password
            </button>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => {
                  onEdit(org);
                }}
                className="py-2 px-2.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>

              <button
                onClick={() => {
                  onToggleActive(org);
                }}
                className={`py-2 px-2.5 border rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  org.isActive
                    ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-900"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                {org.isActive ? "Deactivate" : "Activate"}
              </button>

              <button
                onClick={() => {
                  onDelete(org);
                }}
                className="py-2 px-2.5 bg-white dark:bg-gray-800 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
