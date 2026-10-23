import React from "react";
import { LogOut } from "lucide-react";
import { SysAdminHeaderProps } from "../../../types";

export const SysAdminHeader: React.FC<SysAdminHeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-sky-100 dark:border-gray-800 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-black tracking-wider shadow-md text-sm">
            PM
          </div>
          <div>
            <span className="font-extrabold text-gray-800 dark:text-gray-200 tracking-tight text-base sm:text-lg">PlanMate</span>
            <span className="text-[10px] font-bold text-sky-600 border border-sky-100 dark:border-gray-800 px-1.5 py-0.5 rounded ml-2 uppercase tracking-wide bg-sky-50/50 dark:bg-sky-950/20">
              System Admin Site
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-250">{user?.name || "System Administrator"}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" /> Log Out
          </button>
        </div>
      </div>
    </header>
  );
};
