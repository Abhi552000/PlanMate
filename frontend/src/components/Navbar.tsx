import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings, Zap, Bell, CheckCheck } from "lucide-react";
import axiosInstance from "../config";
import { ROUTES } from "../constants/routeConstant";
import { IUser, INotification } from "../types";

interface NavbarProps {
  user?: Partial<IUser> | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user = {}, onLogout }) => {
  const menuref = useRef<HTMLDivElement>(null);
  const notiref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notiOpen, setNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

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

  const fetchNotifications = async () => {
    try {
      const { data } = await axiosInstance.get("/api/notifications");
      if (data?.success && data?.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.put("/api/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const handleNotiClick = async (noti: INotification) => {
    setNotiOpen(false);
    if (!noti.read) {
      try {
        await axiosInstance.put(`/api/notifications/${noti._id}/read`);
        setNotifications(prev => prev.map(n => n._id === noti._id ? { ...n, read: true } : n));
      } catch (err) {
        console.error("Error marking read:", err);
      }
    }
    if (noti.link) {
      navigate(noti.link);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
        {/* LOGO */}
        <div
          className=" flex items-center gap-2 cursor-pointer group"
          onClick={() => {
            navigate(ROUTES.DASHBOARD);
          }}
        >
          {/* LOGO */}
          <div
            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br 
          from-cyan-500 via-sky-500 to-indigo-500 shadow-lg group-hover:shadow-sky-300/50
          group-hover:scale-105 transition-all duration-300"
          >
            <Zap className="w-6 h-6 text-white" />
            <div className="absolute -bottom-1 -middle-1 w-3 h-3 bg-white rounded-full shadow-md animate-ping" />
          </div>

          {/* BRAND NAME */}
          <span className=" text-2xl font-extrabold bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent tracking-wide">
            PlanMate
          </span>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
          {/* Dark mode toggle */}
          <button
            onClick={() => {
              const html = document.documentElement;
              if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
              } else {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
              }
              setIsDark(html.classList.contains('dark'));
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-300 rounded-full cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          <button
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-300 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-full cursor-pointer"
            onClick={() => navigate(ROUTES.PROFILE)}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Notifications Dropdown */}
          <div ref={notiref} className="relative">
            <button
              onClick={() => setNotiOpen(prev => !prev)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-300 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-full cursor-pointer relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notiOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
                <div className="p-3.5 border-b border-sky-50 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                  <span className="font-bold text-xs text-gray-800 dark:text-gray-250">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-sky-600 hover:text-sky-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-sky-50/45 dark:divide-gray-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400 dark:text-gray-500 font-semibold">
                      All caught up! 🎉
                    </div>
                  ) : (
                    notifications.map((noti) => (
                      <div
                        key={noti._id}
                        onClick={() => handleNotiClick(noti)}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-sky-50/40 dark:hover:bg-gray-800/40 ${
                          !noti.read ? "bg-sky-50/[0.15] dark:bg-sky-950/10 font-medium" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="font-bold text-gray-800 dark:text-gray-250">
                            {noti.title}
                          </span>
                          {!noti.read && (
                            <span className="w-1.5 h-1.5 bg-sky-500 rounded-full shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">
                          {noti.message}
                        </p>
                        <span className="text-[9px] text-gray-400 mt-1 block">
                          {new Date(noti.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div ref={menuref} className="relative">
            <button
              onClick={handleMenuToggle}
              className="flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer hover:bg-sky-50 dark:hover:bg-gray-800 transition-colors duration-300 border border-transparent hover:border-sky-200 dark:hover:border-gray-700"
            >
              <div className="relative">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full shadow-sm" />
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 text-white font-semibold shadow-sm">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="text-left hidden md:block text-xs md:text-sm max-w-[120px]">
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
                <p className="text-gray-500 dark:text-gray-400 font-normal truncate text-[10px]">{user?.email}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {menuOpen && (
              <ul className="absolute top-14 right-0 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-sky-100 dark:border-gray-800 z-50 p-1 animate-fadeIn">
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
