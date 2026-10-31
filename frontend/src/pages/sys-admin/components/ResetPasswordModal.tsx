import React from "react";
import { KeyRound, Check, Copy, X, AlertTriangle } from "lucide-react";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  org: any;
  result: any;
  loading: boolean;
  onConfirm: () => void;
  onCopy: () => void;
  copied: boolean;
}

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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl max-w-md w-full shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-800">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">
                Reset Admin Credentials
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Generate temporary login password
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {result ? (
          /* RESULT STATE: Shows Generated Password with 1-click Copy */
          <div className="space-y-4 py-1 text-center">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                Credentials Generated!
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                New temporary password for{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {org.name}
                </span>
              </p>
            </div>

            <div className="bg-sky-50/50 dark:bg-gray-950/60 p-4 rounded-xl border border-sky-100 dark:border-gray-800 text-left text-xs space-y-2.5">
              <div>
                <span className="block font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[9px]">
                  Admin Account
                </span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {result.name} ({result.email})
                </span>
              </div>

              <div>
                <span className="block font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[9px]">
                  Temporary Password
                </span>
                <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-sky-200 dark:border-gray-700 mt-1 select-all font-mono font-bold text-gray-900 dark:text-gray-100">
                  <span>{result.temporaryPassword}</span>
                  <button
                    onClick={onCopy}
                    className="text-sky-600 dark:text-sky-400 hover:text-sky-700 p-1 hover:bg-sky-50 dark:hover:bg-gray-800 rounded transition-colors cursor-pointer flex items-center gap-1 font-sans text-xs font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* CONFIRMATION STATE */
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <p>
                This will immediately replace the current password for{" "}
                <span className="font-bold">{org.admin?.name || "Admin"}</span> (
                <span className="font-mono">{org.admin?.email}</span>) with a new secure temporary password.
              </p>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Organization:</span>{" "}
                {org.name}
              </p>
              <p>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Representative:</span>{" "}
                {org.admin?.name || "N/A"}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {loading ? "Generating..." : "Generate New Password"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
