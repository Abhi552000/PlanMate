import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Zap, Menu } from "lucide-react";
import { ROUTES } from "../constants/routeConstant";
import { INotification, NavbarProps } from "../types";
import { notificationService } from "../services/notificationService";
import { orgService } from "../services/orgService";
import { CONSOLE_ERRORS } from "../constants/messages";
import { NotificationDropdown } from "./navbar/NotificationDropdown";
import { UserMenuDropdown } from "./navbar/UserMenuDropdown";

const Navbar: React.FC<NavbarProps> = ({
  user = {},
  onLogout,
  onToggleMobileMenu,
  hasSidebar,
}) => {
  const menuref = useRef<HTMLDivElement>(null);
  const notiref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [orgName, setOrgName] = useState("");

  const fetchOrgName = useCallback(async () => {
    if (!user || user.role === "system_admin") return;
    try {
      const data = await orgService.getOrgDetails();
      if (data?.success && data?.organization) {
        setOrgName(data.organization.name);
      }
    } catch (err) {
      console.error(CONSOLE_ERRORS.FETCH_ORG_NAME, err);
    }
  }, [user]);

  useEffect(() => {
    fetchOrgName();
  }, [fetchOrgName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuref.current && !menuref.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleNotiOutside = (event: MouseEvent) => {
      if (notiref.current && !notiref.current.contains(event.target as Node)) {
        setNotiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleNotiOutside);
    return () => document.removeEventListener("mousedown", handleNotiOutside);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      if (data?.success && Array.isArray(data?.notifications)) {
        setNotifications((prev) => {
          if (prev.length === data.notifications.length) {
            const hasChanged = data.notifications.some(
              (n: INotification, idx: number) => n._id !== prev[idx]?._id || n.read !== prev[idx]?.read
            );
            if (!hasChanged) return prev;
          }
          return data.notifications;
        });
      }
    } catch (err) {
      console.error(CONSOLE_ERRORS.FETCH_NOTIFICATIONS, err);
    }
  }, []);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      fetchNotifications();
    }, 800);
    const interval = setInterval(fetchNotifications, 15000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(CONSOLE_ERRORS.MARK_ALL_READ, err);
    }
  };

  const handleNotiClick = async (noti: INotification) => {
    setNotiOpen(false);
    if (!noti.read) {
      try {
        await notificationService.markAsRead(noti._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === noti._id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.error(CONSOLE_ERRORS.MARK_READ, err);
      }
    }
    if (noti.link) {
      navigate(noti.link);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMenuToggle = () => setMenuOpen((prev) => !prev);

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header
      className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm 
    border-b border-gray-200 dark:border-gray-800 font-sans"
    >
      <div className="flex flex-row items-center justify-between gap-2 md:gap-4 px-4 sm:px-6 md:px-8 py-3 w-full">
        {/* LOGO & ORG BADGE */}
        <div className="flex items-center gap-2 sm:gap-3">
          {hasSidebar && onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 -ml-1 text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            className=" flex items-center gap-2 cursor-pointer group"
            onClick={() => {
              navigate(ROUTES.DASHBOARD);
            }}
          >
            {/* LOGO */}
            <div
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br 
            from-cyan-500 via-sky-500 to-indigo-500 shadow-sm"
            >
              <Zap className="w-6 h-6 text-white" />
            </div>

            {/* BRAND NAME */}
            <span className=" text-2xl font-extrabold bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent tracking-wide">
              PlanMate
            </span>
          </div>

          {orgName && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase bg-sky-50 dark:bg-gray-800 text-sky-600 dark:text-sky-400 rounded-full border border-sky-100 dark:border-gray-700 tracking-wider shadow-xs">
              {orgName} Workspace
            </span>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Dark mode toggle */}
          <button
            onClick={() => {
              const html = document.documentElement;
              if (html.classList.contains("dark")) {
                html.classList.remove("dark");
                localStorage.setItem("theme", "light");
              } else {
                html.classList.add("dark");
                localStorage.setItem("theme", "dark");
              }
              setIsDark(html.classList.contains("dark"));
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-300 rounded-full cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          <button
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-300 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-full cursor-pointer"
            onClick={() => navigate(ROUTES.PROFILE)}
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Notifications Dropdown */}
          <NotificationDropdown
            notiOpen={notiOpen}
            setNotiOpen={setNotiOpen}
            notifications={notifications}
            unreadCount={unreadCount}
            handleMarkAllRead={handleMarkAllRead}
            handleNotiClick={handleNotiClick}
            notiref={notiref}
          />

          {/* User Menu Dropdown */}
          <UserMenuDropdown
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            handleMenuToggle={handleMenuToggle}
            user={user}
            handleLogout={handleLogout}
            navigate={navigate}
            menuref={menuref}
          />
        </div>
      </div>
    </header>
  );
};

export default React.memo(Navbar);
