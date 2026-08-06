import React, { useState, useEffect } from "react";
import { X, MessageSquare } from "lucide-react";

interface AccessRemarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remark: string) => void;
  title: string;
  description: string;
  loading?: boolean;
}

export const AccessRemarkModal: React.FC<AccessRemarkModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  loading = false,
}) => {
  const [remark, setRemark] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRemark("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(remark.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-sky-100 dark:border-gray-800 max-w-md w-full p-6 space-y-4 animate-scaleUp animate-duration-150">
        <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-800 pb-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base flex items-center gap-1.5">
            <MessageSquare className="w-5 h-5 text-sky-500" /> {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-gray-550 dark:text-gray-400 leading-normal">
            {description}
          </p>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Reason / Remark
            </label>
            <textarea
              required
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="e.g. Contract ended, temporary leave, role reassignment..."
              className="w-full px-3 py-2 text-xs border border-sky-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-gray-750 dark:text-gray-300 font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-sky-50 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-sky-200 dark:border-gray-800 text-gray-650 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-800 font-bold rounded-lg text-xs transition-colors cursor-pointer bg-white dark:bg-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !remark.trim()}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-xs hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : "Confirm Action"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
