import React, { useState } from "react";
import { Copy, Check, X, ExternalLink } from "lucide-react";
import { TenantDetailModalProps } from "../../../types";
import { TENANT_MODAL_TEXTS } from "../../../constants/billingTexts";

export const TenantDetailModal: React.FC<TenantDetailModalProps> = ({
  org,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!org) return null;

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const statuses: string[] =
    Array.isArray(org.statuses) && org.statuses.length > 0
      ? org.statuses
      : ["To Do", "In Progress", "Done", "Reopen"];

  const memberCount = org.memberCount !== undefined ? org.memberCount : 0;
  const maxSeats = org.subscription?.maxMembers || 5;
  const seatPercent = Math.min(100, Math.round((memberCount / maxSeats) * 100));
  const workItemsCount =
    org.taskCount !== undefined ? org.taskCount : org.taskCounter || 0;

  const formattedCreatedDate = org.createdAt
    ? new Date(org.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl shadow-2xl max-w-4xl w-full p-6 sm:p-7 space-y-5 animate-scaleUp max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Organization Name, Status & Plan */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
              {org.name?.[0]?.toUpperCase() || "O"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-xl leading-tight truncate">
                  {org.name}
                </h3>
                {org.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {TENANT_MODAL_TEXTS.TITLE_ACTIVE}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {TENANT_MODAL_TEXTS.TITLE_DEACTIVATED}
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900">
                  {org.subscription?.planName || TENANT_MODAL_TEXTS.DEFAULT_PLAN}
                </span>
              </div>
              {org.slug && (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                  /{org.slug}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label={TENANT_MODAL_TEXTS.ARIA_CLOSE}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card 1: Organization & Administrator Details (Top Card) */}
        <div className="space-y-2">
          <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {TENANT_MODAL_TEXTS.LABEL_GENERAL_INFO}
          </span>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              {/* Organization Name */}
              <div>
                <span className="block text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {TENANT_MODAL_TEXTS.MODAL_TITLE}
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {org.name}
                </span>
              </div>

              {/* Organization ID */}
              <div>
                <span className="block text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {TENANT_MODAL_TEXTS.LABEL_ORG_ID}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-semibold text-gray-900 dark:text-gray-100 truncate select-all">
                    {org._id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(org._id, "id")}
                    className="p-0.5 rounded text-gray-400 hover:text-sky-600 transition-colors cursor-pointer shrink-0"
                    title={TENANT_MODAL_TEXTS.TOOLTIP_COPY_ID}
                  >
                    {copiedKey === "id" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {copiedKey === "id" && (
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {TENANT_MODAL_TEXTS.MSG_COPIED}
                    </span>
                  )}
                </div>
              </div>

              {/* Created Date */}
              <div>
                <span className="block text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {TENANT_MODAL_TEXTS.LABEL_CREATED_DATE}
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {formattedCreatedDate}
                </span>
              </div>

              {/* Industry / Sector */}
              <div>
                <span className="block text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {TENANT_MODAL_TEXTS.LABEL_INDUSTRY}
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {org.industry || "—"}
                </span>
              </div>

              {/* Company Size */}
              <div>
                <span className="block text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {TENANT_MODAL_TEXTS.LABEL_COMPANY_SIZE}
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {org.companySize ? `${org.companySize} ${TENANT_MODAL_TEXTS.EMPLOYEES_SUFFIX}` : "—"}
                </span>
              </div>

              {/* Website URL */}
              <div>
                <span className="block text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {TENANT_MODAL_TEXTS.LABEL_WEBSITE}
                </span>
                {org.website ? (
                  <a
                    href={
                      org.website.startsWith("http")
                        ? org.website
                        : `https://${org.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-gray-900 dark:text-gray-100 text-sm hover:underline inline-flex items-center gap-1 truncate max-w-full"
                  >
                    <span className="truncate">{org.website.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  </a>
                ) : (
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">—</span>
                )}
              </div>

              {/* Location / Region */}
              <div>
                <span className="block text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {TENANT_MODAL_TEXTS.LABEL_LOCATION}
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {org.location || "—"}
                </span>
              </div>

              {/* Administrator Name */}
              <div>
                <span className="block text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {TENANT_MODAL_TEXTS.LABEL_ADMIN_REP}
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {org.admin?.name || TENANT_MODAL_TEXTS.LABEL_UNASSIGNED}
                </span>
              </div>

              {/* Administrator Email */}
              <div>
                <span className="block text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {TENANT_MODAL_TEXTS.LABEL_ADMIN_EMAIL}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-gray-900 dark:text-gray-100 font-bold truncate select-all">
                    {org.admin?.email || TENANT_MODAL_TEXTS.LABEL_NO_EMAIL}
                  </span>
                  {org.admin?.email && (
                    <button
                      type="button"
                      onClick={() => handleCopy(org.admin.email, "email")}
                      className="p-0.5 rounded text-gray-400 hover:text-sky-600 transition-colors cursor-pointer shrink-0"
                      title={TENANT_MODAL_TEXTS.TOOLTIP_COPY_EMAIL}
                    >
                      {copiedKey === "email" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                  {copiedKey === "email" && (
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {TENANT_MODAL_TEXTS.MSG_COPIED}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Phone */}
              <div>
                <span className="block text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {TENANT_MODAL_TEXTS.LABEL_CONTACT_PHONE}
                </span>
                {org.phone ? (
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${org.phone}`}
                      className="font-bold text-gray-900 dark:text-gray-100 text-sm hover:underline"
                    >
                      {org.phone}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(org.phone, "phone")}
                      className="p-0.5 rounded text-gray-400 hover:text-sky-600 transition-colors cursor-pointer shrink-0"
                      title={TENANT_MODAL_TEXTS.TOOLTIP_COPY_PHONE}
                    >
                      {copiedKey === "phone" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">—</span>
                )}
              </div>

              {/* Subscription Plan */}
              <div>
                <span className="block text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {TENANT_MODAL_TEXTS.LABEL_SUBSCRIPTION}
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                  {org.subscription?.planName || TENANT_MODAL_TEXTS.DEFAULT_PLAN}
                </span>
              </div>

              {/* Billing Cycle */}
              <div>
                <span className="block text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {TENANT_MODAL_TEXTS.LABEL_BILLING_CYCLE}
                </span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm capitalize">
                  {org.subscription?.billingCycle || TENANT_MODAL_TEXTS.DEFAULT_BILLING_CYCLE}
                </span>
              </div>
            </div>

            {/* Description if present */}
            {org.description && (
              <div className="pt-3 border-t border-gray-200/60 dark:border-gray-800 text-xs">
                <span className="block text-gray-400 dark:text-gray-500 font-medium mb-1">
                  {TENANT_MODAL_TEXTS.LABEL_DESCRIPTION}
                </span>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-xs">
                  {org.description}
                </p>
              </div>
            )}

            {/* Deactivation Remark if inactive */}
            {!org.isActive && org.remark && (
              <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs">
                <span className="font-bold block mb-0.5">{TENANT_MODAL_TEXTS.LABEL_DEACTIVATION_NOTE}</span>
                <p className="italic">{org.remark}</p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Workspace Utilization & Activity (Below Card 1) */}
        <div className="space-y-2">
          <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {TENANT_MODAL_TEXTS.LABEL_UTILIZATION_TITLE}
          </span>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 space-y-4">
            {/* Utilization Metrics: Seats & Tickets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Seat Utilization */}
              <div className="space-y-2 p-4 rounded-xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    {TENANT_MODAL_TEXTS.LABEL_SEAT_USAGE}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {seatPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all"
                    style={{ width: `${seatPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900 dark:text-gray-100">
                    {TENANT_MODAL_TEXTS.SEATS_FRACTION(memberCount, maxSeats)}
                  </span>
                  <span className="text-gray-400 text-[11px]">
                    {maxSeats - memberCount > 0
                      ? TENANT_MODAL_TEXTS.SEATS_AVAILABLE(maxSeats - memberCount)
                      : TENANT_MODAL_TEXTS.SEATS_CAPACITY_REACHED}
                  </span>
                </div>
              </div>

              {/* Lifetime Tickets */}
              <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 flex flex-col justify-between">
                <span className="block text-gray-500 dark:text-gray-400 text-xs font-medium">
                  {TENANT_MODAL_TEXTS.LABEL_TOTAL_WORK_ITEMS}
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 my-1">
                  {workItemsCount}
                </span>
                <span className="block text-[11px] text-gray-400">
                  {TENANT_MODAL_TEXTS.TOTAL_TASKS_LOGGED}
                </span>
              </div>
            </div>

            {/* Workflow Columns (No count) */}
            <div className="pt-3 border-t border-gray-200/60 dark:border-gray-800 space-y-2">
              <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium">
                {TENANT_MODAL_TEXTS.LABEL_WORKFLOW_COLUMNS}
              </span>
              <div className="flex flex-wrap gap-2">
                {statuses.map((statusName) => (
                  <span
                    key={statusName}
                    className="inline-flex items-center px-3 py-1 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-2xs"
                  >
                    {statusName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            {TENANT_MODAL_TEXTS.BTN_DONE}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantDetailModal;
