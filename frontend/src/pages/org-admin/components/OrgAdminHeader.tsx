import React from "react";
import { Building, UserPlus } from "lucide-react";

interface OrgAdminHeaderProps {
  orgName: string;
  onOnboardClick: () => void;
}

export const OrgAdminHeader: React.FC<OrgAdminHeaderProps> = ({ orgName, onOnboardClick }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 pb-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl text-white shadow-md">
          <Building className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-250">
            {orgName || "Manage Team Workspace"}
          </h1>
          <p className="text-xs font-semibold text-gray-400">
            Approve pending access requests, monitor tickets, and manage team members.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <button
          onClick={onOnboardClick}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow hover:from-cyan-600 hover:to-sky-750"
        >
          <UserPlus className="w-4 h-4" /> Onboard Team Member
        </button>
      </div>
    </div>
  );
};
