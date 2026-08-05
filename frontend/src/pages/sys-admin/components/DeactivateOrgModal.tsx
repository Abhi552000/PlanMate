import React from "react";
import { Power, X } from "lucide-react";

interface DeactivateOrgModalProps {
  deactivatingOrg: any;
  onClose: () => void;
  deactivateRemark: string;
  setDeactivateRemark: (val: string) => void;
  togglingStatus: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const DeactivateOrgModal: React.FC<DeactivateOrgModalProps> = ({
  deactivatingOrg,
  onClose,
  deactivateRemark,
  setDeactivateRemark,
  togglingStatus,
  onSubmit,
}) => {
  if (!deactivatingOrg) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 border border-sky-101 dark:border-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleUp">
        <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-800 pb-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base flex items-center gap-1.5">
            <Power className="w-5 h-5 text-red-505" /> Deactivate {deactivatingOrg.name}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Reason for Deactivation (Remark)
            </label>
            <textarea
              rows={3}
              value={deactivateRemark}
              onChange={(e) => setDeactivateRemark(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-sky-101 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-955 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-gray-700 dark:text-gray-300 font-medium"
              placeholder="e.g. Payment pending, License expired, Contract ended"
              required
            />
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
