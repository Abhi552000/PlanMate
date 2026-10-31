import React from "react";
import { KeyRound, Check, Copy, X } from "lucide-react";
import { ResetPasswordModalProps } from "../../../types";
import { RESET_PASSWORD_TEXTS } from "../../../constants/billingTexts";

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  org,
  result,
  loading,
  onConfirm,
  onCopy,
  copied,
}) => {
  if (!isOpen || !org) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl max-w-md w-full shadow-xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-500 shrink-0">
              <KeyRound className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">
                {RESET_PASSWORD_TEXTS.TITLE}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {RESET_PASSWORD_TEXTS.SUBTITLE}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {result ? (
          /* RESULT STATE: Shows Generated Password with Copy action */
          <div className="space-y-4">
            <div className="p-3 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-900 text-xs text-sky-800 dark:text-sky-300">
              <p className="font-semibold text-gray-900 dark:text-white">
                {RESET_PASSWORD_TEXTS.SUCCESS_TITLE}
              </p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                {RESET_PASSWORD_TEXTS.SUCCESS_SUBTITLE(org.name)}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 text-xs space-y-3">
              <div>
                <span className="block font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                  {RESET_PASSWORD_TEXTS.LABEL_ADMIN_ACCOUNT}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-xs mt-0.5 block">
                  {result.name} ({result.email})
                </span>
              </div>

              <div>
                <span className="block font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                  {RESET_PASSWORD_TEXTS.LABEL_TEMP_PASSWORD}
                </span>
                <div className="flex items-center justify-between bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-700 mt-1 select-all font-mono font-bold text-gray-900 dark:text-white text-xs">
                  <span>{result.temporaryPassword}</span>
                  <button
                    onClick={onCopy}
                    className="text-sky-600 dark:text-sky-400 hover:text-sky-700 p-1 hover:bg-sky-50 dark:hover:bg-gray-800 rounded transition-colors cursor-pointer flex items-center gap-1 font-sans text-xs font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {RESET_PASSWORD_TEXTS.TOOLTIP_COPIED}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                        <span>{RESET_PASSWORD_TEXTS.TOOLTIP_COPY}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                {RESET_PASSWORD_TEXTS.BTN_DONE}
              </button>
            </div>
          </div>
        ) : (
          /* CONFIRMATION STATE */
          <div className="space-y-4">
            <div className="p-3 bg-sky-50/50 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-900 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                {RESET_PASSWORD_TEXTS.WARNING_CONFIRM(
                  org.admin?.name || "Admin",
                  org.admin?.email || "—"
                )}
              </p>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 bg-gray-50/50 dark:bg-gray-950/40 p-3 rounded-xl border border-slate-200 dark:border-gray-800">
              <p className="flex justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {RESET_PASSWORD_TEXTS.LABEL_ORG}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">{org.name}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {RESET_PASSWORD_TEXTS.LABEL_ADMIN}
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  {org.admin?.name || "Unassigned"}
                </span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-[38px] px-3.5 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {RESET_PASSWORD_TEXTS.BTN_CANCEL}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="h-[38px] px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>
                  {loading
                    ? RESET_PASSWORD_TEXTS.BTN_RESETTING
                    : RESET_PASSWORD_TEXTS.BTN_CONFIRM}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
