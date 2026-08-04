import React, { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { Circle, Clock, TrendingUp, Zap } from "lucide-react";
import axiosInstance from "../config";
import { IUser, ITask } from "../types";

interface LayoutProps {
  user: IUser | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState("kanban");
  const location = useLocation();
  const isDashboard = location.pathname === "/";

  const fetchTasks = useCallback(async (silent = true) => {
    if (user?.role === "system_admin") {
      setTasks([]);
      return;
    }
    if (!silent) setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");
      const { data } = await axiosInstance.get("/api/tasks/gp");
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.tasks)
        ? data.tasks
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setTasks(arr);
    } catch (err: any) {
      console.log("err", err);
      setError(err.message || "Could not load tasks.");
      if (err?.response?.status === 401) onLogout();
    } finally {
      if (!silent) setLoading(false);
    }
  }, [onLogout, user?.role]);

  useEffect(() => {
    fetchTasks(false);
  }, [fetchTasks]);



  // Loading
  if (loading && tasks.length === 0)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className=" animate-spin rounded-full h-12 w-12 border-t-2 border-sky-500" />
      </div>
    );

  // Error
  if (error && tasks.length === 0)
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 flex items-center justify-center">
        <div className=" bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-900/50 max-w-md">
          <p className=" font-medium mb-2">Error loading tasks</p>
          <p className=" text-sm">{error}</p>
          <button
            onClick={() => fetchTasks(false)}
            className=" mt-4 py-2 px-4 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  const hasSidebar = user?.role === "org_admin";

  return (
    <div className=" min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar user={user || undefined} onLogout={onLogout} />
      {hasSidebar && <Sidebar user={user} tasks={tasks} />}

      <div className={`${hasSidebar ? "ml-0 md:ml-20 lg:ml-56" : "ml-0"} transition-all duration-300 min-h-screen`}>
        <div className="px-4 sm:px-6 md:px-8 pt-8 pb-6 w-full transition-all duration-300 text-gray-900 dark:text-gray-100">
        {error && (
          <div className=" mb-4 bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 flex justify-between items-center text-sm animate-fadeIn">
            <span>Failed to sync tasks: {error}</span>
            <button
              onClick={() => fetchTasks(true)}
              className=" underline text-red-700 hover:text-red-900 font-medium"
            >
              Retry
            </button>
          </div>
        )}
        <div className="w-full">
          <Outlet context={{ tasks, refreshTasks: fetchTasks, viewMode, setViewMode }} />
        </div>
      </div>
    </div>
  </div>
);
};

export default Layout;
