import React from "react";
import { Bell, CheckCheck } from "lucide-react";
import { INotification, NotificationDropdownProps } from "../../types";

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notiOpen,
  setNotiOpen,
  notifications,
  unreadCount,
  handleMarkAllRead,
  handleNotiClick,
  notiref,
}) => {
  return (
    <div ref={notiref} className="relative">
      <button
        onClick={() => setNotiOpen((prev) => !prev)}
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
                    {new Date(noti.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
