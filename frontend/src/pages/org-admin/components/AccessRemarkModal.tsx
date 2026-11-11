import React, { useState, useEffect } from "react";
import { X, MessageSquare, ShieldCheck } from "lucide-react";
import { AccessRemarkModalProps } from "../../../types";

export const AccessRemarkModal: React.FC<AccessRemarkModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  loading = false,
  showRoleSelector = false,
  availableRoles = [],
  defaultRoleId = "",
}) => {
  const [remark, setRemark] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(defaultRoleId);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRemark("");
      setError("");
      setSelectedRoleId(defaultRoleId || (availableRoles[0]?._id || ""));
    }
  }, [isOpen, defaultRoleId, availableRoles]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remark.trim()) {
      setError("Reason / Remark is mandatory.");
      return;
    }
    onConfirm(remark.trim(), showRoleSelector ? selectedRoleId : undefined);
  };

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-sky-100 dark:border-gray-800 max-w-md w-full p-6 space-y-4 animate-scaleUp animate-duration-150"
        onClick={(e) => e.stopPropagation()}
      >
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
          <div className="text-xs text-gray-550 dark:text-gray-400 leading-normal">
            {description}
          </div>

          {showRoleSelector && availableRoles.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                <span>Assign Workspace Role</span>
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-sky-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800 dark:text-gray-200 font-medium"
              >
                {availableRoles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} {r.isSystemDefault ? "(Default)" : "(Custom)"}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                This determines what resources and actions the user can perform.
              </p>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
              <span>Reason / Remark</span>
              <span className="text-amber-500 text-xs font-bold">*</span>
            </label>
            <textarea
              rows={3}
              value={remark}
              onChange={(e) => {
                setRemark(e.target.value);
                if (error && e.target.value.trim()) setError("");
              }}
              onBlur={() => {
                if (!remark.trim()) setError("Reason / Remark is mandatory.");
              }}
              placeholder="e.g. Approved team member, onboarding contract developer..."
              className={`w-full px-3 py-2 text-xs border rounded-lg bg-white dark:bg-gray-800 focus:outline-none transition-all text-gray-750 dark:text-gray-300 font-medium ${
                error
                  ? "border-amber-400 focus:ring-2 focus:ring-amber-400/50"
                  : "border-sky-100 dark:border-gray-700 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              }`}
            />
            {error && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                {error}
              </p>
            )}
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
              disabled={loading}
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
