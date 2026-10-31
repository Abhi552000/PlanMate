import React from "react";
import { UserPlus } from "lucide-react";
import { OrgAdminHeaderProps } from "../../../types";
import { ADD_BUTTON, HEADER } from "../../../assets/dummy";

export const OrgAdminHeader: React.FC<OrgAdminHeaderProps> = ({ orgName, onOnboardClick }) => {
  return (
    <div className={HEADER}>
      <div className="min-w-0">
        <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          <span className="truncate">{orgName ? `${orgName} Team` : "Manage Team"}</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
          Invite members, assign roles, and manage workspace permissions
        </p>
      </div>
      <button onClick={onOnboardClick} className={ADD_BUTTON}>
        <UserPlus className="w-4.5 h-4.5" />
        Onboard Member
      </button>
    </div>
  );
};
