import React, { useCallback, useEffect, useState, useMemo } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchTasks } from "../store/slices/taskSlice";
import { LayoutProps } from "../types";

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const loading = useAppSelector((state) => state.tasks.loading);
  const error = useAppSelector((state) => state.tasks.error);
  const [viewMode, setViewMode] = useState("kanban");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Collapsible sidebar state (persisted across page reloads like Jira)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("planmate_sidebar_collapsed");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("planmate_sidebar_collapsed", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // 2. Jira keyboard shortcut: press "[" to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.key === "[") {
        e.preventDefault();
        handleToggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggleCollapse]);

  const fetchTasksData = useCallback(
    async (_silent = true) => {
      if (user?.role === "system_admin") return;
      dispatch(fetchTasks());
    },
    [dispatch, user?.role]
  );

  const outletContext = useMemo(
    () => ({
      tasks,
      refreshTasks: fetchTasksData,
      viewMode,
      setViewMode,
      loading,
    }),
    [tasks, fetchTasksData, viewMode, loading]
  );

  useEffect(() => {
    fetchTasksData(false);
  }, [fetchTasksData]);

  const hasSidebar = user?.role === "org_admin" || user?.role === "member";

  // Error state (rendered AFTER all hooks)
  if (error && tasks.length === 0)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-900/50 max-w-md">
          <p className="font-medium mb-2">Error loading tasks</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => fetchTasksData(false)}
            className="mt-4 py-2 px-4 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar
        user={user || undefined}
        onLogout={onLogout}
        hasSidebar={hasSidebar}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />
      {hasSidebar && (
        <Sidebar
          user={user}
          tasks={tasks}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      )}

      <main
        className={`${
          hasSidebar ? (isCollapsed ? "pl-0 md:pl-16" : "pl-0 md:pl-60") : "pl-0"
        } transition-all duration-300 ease-in-out min-h-screen w-full overflow-x-hidden`}
      >
        <div className="px-3.5 sm:px-6 md:px-8 pt-3 sm:pt-5 pb-6 w-full transition-all duration-300 text-gray-900 dark:text-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 flex justify-between items-center text-sm animate-fadeIn">
              <span>Failed to sync tasks: {error}</span>
              <button
                onClick={() => fetchTasksData(true)}
                className="underline text-red-700 hover:text-red-900 font-medium"
              >
                Retry
              </button>
            </div>
          )}
          <div className="w-full">
            <Outlet context={outletContext} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default React.memo(Layout);
