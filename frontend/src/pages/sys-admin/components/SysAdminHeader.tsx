import React, { useState } from "react";
import { LogOut, Menu, Sun, Moon } from "lucide-react";
import { SysAdminHeaderProps } from "../../../types";
import { PlanMateLogo } from "../../../components/common/PlanMateLogo";

export const SysAdminHeader: React.FC<SysAdminHeaderProps> = ({
  user,
  onLogout,
  onToggleMobileMenu,
}) => {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setIsDark(html.classList.contains("dark"));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xs border-b border-gray-200 dark:border-gray-800 font-sans">
      <div className="flex flex-row items-center justify-between gap-2 md:gap-4 px-3 sm:px-6 lg:px-8 h-[52px] w-full">
        {/* BRAND LOGO & BADGE */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-1.5 -ml-1 text-gray-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 select-none">
            <PlanMateLogo size={28} showText textClassName="text-base sm:text-xl font-bold tracking-tight" />
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold uppercase bg-sky-50 dark:bg-gray-800 text-sky-600 dark:text-sky-400 rounded-full border border-sky-100 dark:border-gray-700 tracking-wider shadow-2xs">
            System Admin
          </span>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 rounded-full cursor-pointer text-sm"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
          </button>

          {/* User Representative Info & Logout */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200 dark:border-gray-800">
            <div className="w-7.5 h-7.5 flex items-center justify-center rounded-full bg-sky-500 text-white font-semibold text-xs shadow-2xs">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="text-left hidden md:block text-xs max-w-[140px]">
              <p className="font-medium text-gray-800 dark:text-gray-200 truncate leading-tight">
                {user?.name || "System Admin"}
              </p>
              <p className="text-gray-500 dark:text-gray-400 font-normal truncate text-[10px] leading-tight">
                {user?.email || "admin@planmate.com"}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 cursor-pointer ml-1"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
