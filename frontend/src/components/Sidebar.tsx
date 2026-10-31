import React, { useEffect, useState } from "react";
import { menuItems } from "../assets/dummy";
import {
  Menu,
  X,
  Users,
  Building,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { SidebarProps } from "../types";

const Sidebar: React.FC<SidebarProps> = ({
  user,
  mobileOpen: controlledMobileOpen,
  setMobileOpen: controlledSetMobileOpen,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isControlled = controlledMobileOpen !== undefined;
  const mobileOpen = isControlled ? controlledMobileOpen : internalMobileOpen;
  const setMobileOpen =
    isControlled && controlledSetMobileOpen ? controlledSetMobileOpen : setInternalMobileOpen;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  const renderNavLinks = (isMobile = false) => {
    const collapsedMode = !isMobile && isCollapsed;

    if (user?.role === "system_admin") {
      return (
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/system-admin"
              className={({ isActive }) =>
                [
                  "group relative flex items-center h-10 px-2.5 rounded-lg transition-colors overflow-hidden",
                  isActive
                    ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold border-l-[3px] border-sky-500 pl-[7px]"
                    : "text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70",
                ].join(" ")
              }
              onClick={() => isMobile && setMobileOpen(false)}
            >
              <div className="w-6 h-6 shrink-0 flex items-center justify-center text-sky-500 transition-transform duration-200 group-hover:scale-110">
                <Users className="w-5 h-5" />
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                  collapsedMode
                    ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                    : "max-w-[150px] opacity-100 translate-x-0 ml-3"
                }`}
              >
                System Admin Panel
              </span>
              {collapsedMode && (
                <div className="pointer-events-none fixed left-[68px] px-2.5 py-1 rounded-md bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  System Admin Panel
                </div>
              )}
            </NavLink>
          </li>
        </ul>
      );
    }

    return (
      <ul className="space-y-1">
        {menuItems.map(({ text, path, icon }) => (
          <li key={text}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                [
                  "group relative flex items-center h-10 px-2.5 rounded-lg transition-colors overflow-hidden",
                  isActive
                    ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold border-l-[3px] border-sky-500 pl-[7px]"
                    : "text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70",
                ].join(" ")
              }
              onClick={() => isMobile && setMobileOpen(false)}
            >
              <div className="w-6 h-6 shrink-0 flex items-center justify-center text-sky-500 transition-transform duration-200 group-hover:scale-110">
                {icon}
              </div>
              <span
                className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                  collapsedMode
                    ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                    : "max-w-[150px] opacity-100 translate-x-0 ml-3"
                }`}
              >
                {text}
              </span>
              {collapsedMode && (
                <div className="pointer-events-none fixed left-[68px] px-2.5 py-1 rounded-md bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  {text}
                </div>
              )}
            </NavLink>
          </li>
        ))}

        {user?.role === "org_admin" && (
          <>
            <li className="pt-2">
              <div className="border-t border-gray-100 dark:border-gray-800 my-1 mx-1" />
            </li>
            <li>
              <NavLink
                to="/organization"
                className={({ isActive }) =>
                  [
                    "group relative flex items-center h-10 px-2.5 rounded-lg transition-colors overflow-hidden",
                    isActive
                      ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold border-l-[3px] border-sky-500 pl-[7px]"
                      : "text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70",
                  ].join(" ")
                }
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <div className="w-6 h-6 shrink-0 flex items-center justify-center text-sky-500 transition-transform duration-200 group-hover:scale-110">
                  <Users className="w-5 h-5" />
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                    collapsedMode
                      ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                      : "max-w-[150px] opacity-100 translate-x-0 ml-3"
                  }`}
                >
                  Manage Team
                </span>
                {collapsedMode && (
                  <div className="pointer-events-none fixed left-[68px] px-2.5 py-1 rounded-md bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Manage Team
                  </div>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/subscription"
                className={({ isActive }) =>
                  [
                    "group relative flex items-center h-10 px-2.5 rounded-lg transition-colors overflow-hidden",
                    isActive
                      ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold border-l-[3px] border-sky-500 pl-[7px]"
                      : "text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70",
                  ].join(" ")
                }
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <div className="w-6 h-6 shrink-0 flex items-center justify-center text-sky-500 transition-transform duration-200 group-hover:scale-110">
                  <CreditCard className="w-5 h-5" />
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                    collapsedMode
                      ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                      : "max-w-[150px] opacity-100 translate-x-0 ml-3"
                  }`}
                >
                  Plans & Billing
                </span>
                {collapsedMode && (
                  <div className="pointer-events-none fixed left-[68px] px-2.5 py-1 rounded-md bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Plans & Billing
                  </div>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/workspace-settings"
                className={({ isActive }) =>
                  [
                    "group relative flex items-center h-10 px-2.5 rounded-lg transition-colors overflow-hidden",
                    isActive
                      ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold border-l-[3px] border-sky-500 pl-[7px]"
                      : "text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/70",
                  ].join(" ")
                }
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <div className="w-6 h-6 shrink-0 flex items-center justify-center text-sky-500 transition-transform duration-200 group-hover:scale-110">
                  <Building className="w-5 h-5" />
                </div>
                <span
                  className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out ${
                    collapsedMode
                      ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                      : "max-w-[150px] opacity-100 translate-x-0 ml-3"
                  }`}
                >
                  Workspace Settings
                </span>
                {collapsedMode && (
                  <div className="pointer-events-none fixed left-[68px] px-2.5 py-1 rounded-md bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    Workspace Settings
                  </div>
                )}
              </NavLink>
            </li>
          </>
        )}
      </ul>
    );
  };

  return (
    <>
      {/* DESKTOP COLLAPSIBLE SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col fixed top-[52px] left-0 h-[calc(100vh-52px)] ${
          isCollapsed ? "w-16" : "w-60"
        } bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800 shadow-xs z-30 transition-[width] duration-300 ease-in-out overflow-hidden`}
      >
        {/* Industry standard Header Row with Inside Collapse Button (Figma / Jira / Linear style) */}
        {onToggleCollapse && (
          <div className="h-12 px-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div
              className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
                isCollapsed ? "max-w-0 opacity-0" : "max-w-[140px] opacity-100"
              }`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 truncate">
                Navigation
              </span>
            </div>

            <button
              onClick={onToggleCollapse}
              className={`p-1.5 rounded-lg text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer ${
                isCollapsed ? "mx-auto" : "ml-auto"
              }`}
              title={isCollapsed ? "Expand sidebar ( [ )" : "Collapse sidebar ( [ )"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4.5 h-4.5" />
              ) : (
                <PanelLeftClose className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        )}

        {/* Navigation items list */}
        <div className="py-3 px-2.5 space-y-1 overflow-y-auto flex-1 scrollbar-thin">
          {renderNavLinks()}
        </div>
      </aside>

      {/* MOBILE MENU BUTTON (fallback) */}
      {!isControlled && !mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed md:hidden top-16 left-4 z-40 bg-sky-600 text-white p-2 rounded-full shadow-md hover:bg-sky-700 transition-all cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="absolute top-0 left-0 w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-50 p-4 flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-bold text-sky-600">PlanMate</h2>
              <button
                className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 p-1 rounded-lg transition-colors cursor-pointer"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">{renderNavLinks(true)}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(Sidebar);
