import React from "react";
import { Power, X } from "lucide-react";
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
      className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-800 pb-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base flex items-center gap-1.5">
            <Power className="w-5 h-5 text-red-500" /> Deactivate {deactivatingOrg.name}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
              <span>Reason for Deactivation (Remark)</span>
              <span className="text-red-500 text-xs font-bold">*</span>
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
                  ? "border-red-500 focus:ring-2 focus:ring-red-400/50"
                  : "border-sky-100 dark:border-gray-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              }`}
              placeholder="e.g. Payment pending, License expired, Contract ended"
            />
            {error && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-sky-50 dark:border-gray-800 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-sky-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-800 font-bold rounded-lg text-xs transition-colors cursor-pointer bg-white dark:bg-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={togglingStatus}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg flex items-center justify-center gap-1.5 hover:shadow-md transition-all duration-200 cursor-pointer text-xs"
            >
              Deactivate Instance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
