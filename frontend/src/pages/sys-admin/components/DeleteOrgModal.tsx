import React from "react";
import { X } from "lucide-react";
import { DeleteOrgModalProps } from "../../../types";

export const DeleteOrgModal: React.FC<DeleteOrgModalProps> = ({
  deletingOrg,
  onClose,
  onConfirm,
  deleting = false,
}) => {
  if (!deletingOrg) return null;

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={() => !deleting && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
            Delete {deletingOrg.name}
          </h3>
          <button
            onClick={onClose}
            disabled={deleting}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {deletingOrg.name}
            </span>
            ?
          </p>
          <div className="p-3 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 rounded-xl text-xs text-rose-700 dark:text-rose-300 leading-relaxed font-medium">
            This action cannot be undone. All users, tasks, sprints, and data associated with this tenant will be permanently removed.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            disabled={deleting}
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {deleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Organization</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrgModal;
