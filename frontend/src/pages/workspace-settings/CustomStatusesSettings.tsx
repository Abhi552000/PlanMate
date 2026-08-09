import React from "react";
import { Settings, X } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { CustomStatusesSettingsProps } from "../../types";

export const CustomStatusesSettings: React.FC<CustomStatusesSettingsProps> = ({
  statuses,
  newStatus,
  setNewStatus,
  addingStatus,
  handleAddStatus,
  handleOpenDeleteModal,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250 flex items-center gap-2 border-b border-sky-100 dark:border-gray-800 pb-3">
        <Settings className="w-4.5 h-4.5 text-sky-505" /> Custom Task Statuses
      </h3>

      <form onSubmit={handleAddStatus} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Input
          type="text"
          placeholder="Add new status (e.g. Ready for QA)"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          required
          wrapperClassName="flex-1"
        />
        <Button
          type="submit"
          disabled={!newStatus.trim()}
          loading={addingStatus}
          variant="secondary"
          className="h-[46px] sm:h-[44px] justify-center"
        >
          Add Status
        </Button>
      </form>

      <div className="pt-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
          Active Workspace Statuses
        </label>
        <div className="flex flex-wrap gap-2.5">
          {statuses.map((status) => (
            <div
              key={status}
              className="flex items-center gap-2 px-3 py-1.5 bg-sky-50/50 dark:bg-gray-850 rounded-xl border border-sky-100/55 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm"
            >
              <span>{status}</span>
              <button
                type="button"
                onClick={() => handleOpenDeleteModal(status)}
                className="text-red-405 hover:text-red-650 transition-colors p-0.5 rounded cursor-pointer"
                title={`Delete status "${status}"`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
