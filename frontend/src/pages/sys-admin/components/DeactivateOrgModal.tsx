import React from "react";
import { X } from "lucide-react";
import { DeactivateOrgModalProps } from "../../../types";

export const DeactivateOrgModal: React.FC<DeactivateOrgModalProps> = ({
  deactivatingOrg,
  onClose,
  deactivateRemark,
  setDeactivateRemark,
  togglingStatus,
  onSubmit,
}) => {
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (deactivatingOrg) {
      setError("");
    }
  }, [deactivatingOrg]);

  if (!deactivatingOrg) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deactivateRemark.trim()) {
      setError("Reason / Remark is mandatory.");
      return;
    }
    onSubmit(e);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
            Deactivate Organization
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            Are you sure you want to deactivate{" "}
            <span className="font-bold text-sky-600 dark:text-sky-400">
              {deactivatingOrg.name}
            </span>
            ? Users belonging to this organization will temporarily lose access.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
              <span>Reason for Deactivation (Remark)</span>
              <span className="text-amber-500 text-xs font-bold">*</span>
            </label>
            <textarea
              rows={3}
              value={deactivateRemark}
              onChange={(e) => {
                setDeactivateRemark(e.target.value);
                if (error && e.target.value.trim()) setError("");
              }}
              onBlur={() => {
                if (!deactivateRemark.trim()) setError("Reason / Remark is mandatory.");
              }}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm bg-white dark:bg-gray-950 focus:outline-none transition-all duration-200 font-medium ${
                error
                  ? "border-amber-400 focus:ring-2 focus:ring-amber-400/50"
                  : "border-slate-200 dark:border-gray-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              }`}
              placeholder="Enter reason for deactivation..."
            />
            {error && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={togglingStatus}
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {togglingStatus && (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              <span>Deactivate Organization</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeactivateOrgModal;
