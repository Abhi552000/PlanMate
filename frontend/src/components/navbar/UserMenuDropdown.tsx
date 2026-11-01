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
        aria-label={user?.name ? `${user.name} profile menu` : "User profile menu"}
        className="flex items-center gap-2 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
      >
        <div>
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-7.5 h-7.5 rounded-full shadow-2xs" />
          ) : (
            <div className="w-7.5 h-7.5 flex items-center justify-center rounded-full bg-sky-500 text-white font-semibold text-xs shadow-2xs">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        <div className="text-left hidden md:block text-xs max-w-[110px]">
          <p className="font-medium text-gray-800 dark:text-gray-200 truncate leading-tight">{user?.name}</p>
          <p className="text-gray-500 dark:text-gray-400 font-normal truncate text-[10px] leading-tight">{user?.email}</p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}
        />
      </button>

      {menuOpen && (
        <ul className="absolute top-11 right-0 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-sky-100 dark:border-gray-800 z-50 p-1">
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
          <li className="my-1 border-t border-gray-100 dark:border-gray-800" />
          <li>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              Logout
            </button>
          </li>
        </ul>
      )}
    </div>
  );
});
