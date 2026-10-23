import React from "react";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import { ROUTES } from "../../constants/routeConstant";
import { UserMenuDropdownProps } from "../../types";

export const UserMenuDropdown: React.FC<UserMenuDropdownProps> = React.memo(({
  menuOpen,
  setMenuOpen,
  handleMenuToggle,
  user,
  handleLogout,
  navigate,
  menuref,
}) => {
  return (
    <div ref={menuref} className="relative">
      <button
        onClick={handleMenuToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer hover:bg-sky-50 dark:hover:bg-gray-800 border border-transparent hover:border-sky-200 dark:hover:border-gray-700"
      >
        <div>
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full shadow-sm" />
          ) : (
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 text-white font-semibold shadow-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        <div className="text-left hidden md:block text-xs md:text-sm max-w-[120px]">
          <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
          <p className="text-gray-500 dark:text-gray-400 font-normal truncate text-[10px]">{user?.email}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {menuOpen && (
        <ul className="absolute top-14 right-0 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-sky-100 dark:border-gray-800 z-50 p-1">
          <li>
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate(ROUTES.PROFILE);
              }}
              className="w-full px-3 py-2 text-left rounded-lg hover:bg-sky-50 dark:hover:bg-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 group cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-gray-405 group-hover:text-sky-500 transition-colors" />
              Profile Setting
            </button>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/35 text-red-600 dark:text-red-400 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </li>
        </ul>
      )}
    </div>
  );
});
