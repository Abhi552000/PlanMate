import React, { useEffect, useState } from "react";
import { LINK_CLASSES, menuItems, SIDEBAR_CLASSES } from "../assets/dummy";
import { Menu, X, Users, Building } from "lucide-react";
import { NavLink } from "react-router-dom";
import { SidebarProps } from "../types";

const Sidebar: React.FC<SidebarProps> = ({ user, tasks }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const username = user?.name || "user";
  const initial = username.charAt(0).toUpperCase();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  const renderMenuItems = (isMobile = false) => {
    if (user?.role === "system_admin") {
      return (
        <ul className=" space-y-2">
          <li>
            <NavLink
              to="/system-admin"
              className={({ isActive }) =>
                [
                  LINK_CLASSES.base,
                  isActive ? LINK_CLASSES.active : LINK_CLASSES.inactive,
                  isMobile ? "justify-start" : "lg:justify-start",
                ].join(" ")
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className={LINK_CLASSES.icon}>
                <Users className="w-5 h-5 text-sky-500" />
              </span>
              <span
                className={`${isMobile ? "block" : "hidden lg:block"} ${
                  LINK_CLASSES.text
                }`}
              >
                System Admin Panel
              </span>
            </NavLink>
          </li>
        </ul>
      );
    }

    return (
      <ul className=" space-y-2">
        {menuItems.map(({ text, path, icon }) => (
          <li key={text}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                [
                  LINK_CLASSES.base,
                  isActive ? LINK_CLASSES.active : LINK_CLASSES.inactive,
                  isMobile ? "justify-start" : "lg:justify-start",
                ].join(" ")
              }
              onClick={() => setMobileOpen(false)}
            >
              <span className={LINK_CLASSES.icon}>{icon}</span>
              <span
                className={`${isMobile ? "block" : "hidden lg:block"} ${
                  LINK_CLASSES.text
                }`}
              >
                {text}
              </span>
            </NavLink>
          </li>
        ))}
        {user?.role === "org_admin" && (
          <>
            <li>
              <NavLink
                to="/organization"
                className={({ isActive }) =>
                  [
                    LINK_CLASSES.base,
                    isActive ? LINK_CLASSES.active : LINK_CLASSES.inactive,
                    isMobile ? "justify-start" : "lg:justify-start",
                  ].join(" ")
                }
                onClick={() => setMobileOpen(false)}
              >
                <span className={LINK_CLASSES.icon}>
                  <Users className="w-5 h-5 text-sky-500" />
                </span>
                <span
                  className={`${isMobile ? "block" : "hidden lg:block"} ${
                    LINK_CLASSES.text
                  }`}
                >
                  Manage Team
                </span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/workspace-settings"
                className={({ isActive }) =>
                  [
                    LINK_CLASSES.base,
                    isActive ? LINK_CLASSES.active : LINK_CLASSES.inactive,
                    isMobile ? "justify-start" : "lg:justify-start",
                  ].join(" ")
                }
                onClick={() => setMobileOpen(false)}
              >
                <span className={LINK_CLASSES.icon}>
                  <Building className="w-5 h-5 text-sky-500" />
                </span>
                <span
                  className={`${isMobile ? "block" : "hidden lg:block"} ${
                    LINK_CLASSES.text
                  }`}
                >
                  Workspace Settings
                </span>
              </NavLink>
            </li>
          </>
        )}
      </ul>
    );
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className={SIDEBAR_CLASSES.desktop}>
        <div className=" px-4 py-8 space-y-6 overflow-y-auto flex-1">
          {renderMenuItems()}
        </div>
      </div>

      {/* MOBILE MENU */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className={SIDEBAR_CLASSES.mobileButton}
        >
          <Menu className=" w-5 h-5" />
        </button>
      )}

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className=" fixed inset-0 z-40">
          <div
            className={SIDEBAR_CLASSES.mobileDrawerBackdrop}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={SIDEBAR_CLASSES.mobileDrawer}
            onClick={(e) => e.stopPropagation()}
          >
            <div className=" flex justify-between items-center mb-4 border-b border-sky-100 dark:border-gray-800 pb-3">
              <h2 className=" text-lg font-bold text-sky-600">Menu</h2>
              <button
                className=" text-gray-700 dark:text-gray-300 hover:text-sky-600 p-1 rounded-lg transition-colors cursor-pointer"
                onClick={() => setMobileOpen(false)}
              >
                <X className=" w-5 h-5" />
              </button>
            </div>

            {renderMenuItems(true)}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
