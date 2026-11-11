import React from "react";
import { X } from "lucide-react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Body */}
        <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {message}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading && (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
