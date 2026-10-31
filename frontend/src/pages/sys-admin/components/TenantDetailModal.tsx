import React, { useState } from "react";
import {
  X,
  Users,
  KeyRound,
  Edit,
  Power,
  Trash2,
  Calendar,
  Layers,
  Copy,
  Check,
  CreditCard,
} from "lucide-react";
import { TenantDetailModalProps } from "../../../types";
import { TENANT_MODAL_TEXTS } from "../../../constants/billingTexts";

export const TenantDetailModal: React.FC<TenantDetailModalProps> = ({
  org,
  onClose,
  onResetPassword,
  onEdit,
  onToggleActive,
  onDelete,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Centered Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-800 flex flex-col overflow-hidden animate-fadeIn my-6 max-h-[90vh]">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900 flex items-center justify-center font-black text-lg text-sky-600 dark:text-sky-400 shrink-0 shadow-2xs">
                {org.name?.[0]?.toUpperCase() || "O"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                    {org.name}
                  </h2>
                  {org.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {TENANT_MODAL_TEXTS.TITLE_ACTIVE}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      {TENANT_MODAL_TEXTS.TITLE_DEACTIVATED}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {org.slug && <span>/{org.slug}</span>}
                  {org.createdAt && (
                    <span className="flex items-center gap-1">
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
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto scrollbar-thin">
          {/* KPI Resource Utilization Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
              {TENANT_MODAL_TEXTS.LABEL_RESOURCE_PLAN}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-sky-100 dark:border-gray-800 bg-sky-50/30 dark:bg-gray-950/40">
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-semibold">{TENANT_MODAL_TEXTS.LABEL_TEAM_SIZE}</span>
                </div>
                <p className="text-xl font-black text-gray-900 dark:text-gray-100">
                  {org.memberCount !== undefined ? org.memberCount : "—"}
                </p>
                <span className="text-[10px] text-gray-400 font-medium">{TENANT_MODAL_TEXTS.LABEL_ACTIVE_MEMBERS}</span>
              </div>

              <div className="p-3.5 rounded-xl border border-sky-100 dark:border-gray-800 bg-sky-50/30 dark:bg-gray-950/40">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs font-semibold">{TENANT_MODAL_TEXTS.LABEL_TOTAL_WORK_ITEMS}</span>
                </div>
                <p className="text-xl font-black text-gray-900 dark:text-gray-100">
                  {org.taskCount !== undefined ? org.taskCount : org.taskCounter || 0}
                </p>
                <span className="text-[10px] text-gray-400 font-medium">{TENANT_MODAL_TEXTS.LABEL_LIFETIME_TICKETS}</span>
              </div>

              <div className="p-3.5 rounded-xl border border-sky-100 dark:border-gray-800 bg-sky-50/30 dark:bg-gray-950/40">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs font-semibold">{TENANT_MODAL_TEXTS.LABEL_SUBSCRIPTION}</span>
                </div>
                <p className="text-sm font-black text-gray-900 dark:text-gray-100 truncate">
                  {org.subscription?.planName || "Starter"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-gray-400 font-medium">
                    {TENANT_MODAL_TEXTS.MAX_SEATS(org.subscription?.maxMembers || 5)}
                  </span>
                  <span className="text-[10px] text-gray-300 dark:text-gray-700">•</span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800 capitalize">
                    {org.subscription?.billingCycle || "Monthly"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Representative Details */}
          <div className="p-4 rounded-xl border border-sky-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {TENANT_MODAL_TEXTS.LABEL_ADMIN_REP}
            </h3>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">
                  {org.admin?.name || TENANT_MODAL_TEXTS.LABEL_UNASSIGNED}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5 truncate">
                  {org.admin?.email || TENANT_MODAL_TEXTS.LABEL_NO_EMAIL}
                </p>
              </div>
              {org.admin?.email && (
                <button
                  onClick={handleCopyEmail}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-gray-700 text-gray-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
                  title={TENANT_MODAL_TEXTS.TOOLTIP_COPY_EMAIL}
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
              {TENANT_MODAL_TEXTS.LABEL_WORKFLOW_COLUMNS(statuses.length)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {statuses.map((statusName) => (
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
              <span className="font-bold block mb-1">{TENANT_MODAL_TEXTS.LABEL_DEACTIVATION_NOTE}</span>
              <p className="italic">{org.remark}</p>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            onClick={() => {
              onResetPassword(org);
            }}
            className="h-[38px] px-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <KeyRound className="w-4 h-4" />
            {TENANT_MODAL_TEXTS.BTN_RESET_PASSWORD}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onEdit(org);
              }}
              className="h-[38px] px-3.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs flex-1 sm:flex-initial"
            >
              <Edit className="w-3.5 h-3.5" />
              {TENANT_MODAL_TEXTS.BTN_EDIT}
            </button>

            <button
              onClick={() => {
                onToggleActive(org);
              }}
              className={`h-[38px] px-3.5 border rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs flex-1 sm:flex-initial ${
                org.isActive
                  ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-900"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900"
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              {org.isActive ? TENANT_MODAL_TEXTS.BTN_DEACTIVATE : TENANT_MODAL_TEXTS.BTN_ACTIVATE}
            </button>

            <button
              onClick={() => {
                onDelete(org);
              }}
              className="h-[38px] px-3.5 bg-white dark:bg-gray-800 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs flex-1 sm:flex-initial"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {TENANT_MODAL_TEXTS.BTN_DELETE}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDetailModal;
