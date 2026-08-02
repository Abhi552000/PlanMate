import React, { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { Circle, Clock, TrendingUp, Zap } from "lucide-react";
import axiosInstance from "../config";

const Layout = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    } catch (err) {
      console.log("err", err);
      setError(err.message || "Could not load tasks.");
      if (err?.response?.status === 401) onLogout();
    } finally {
      if (!silent) setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchTasks(false);
  }, [fetchTasks]);

  const stats = useMemo(() => {
    const completedTasks = tasks.filter(
      (t) =>
        t.completed === true ||
        t.completed === 1 ||
        (typeof t.completed === "string" && t.completed.toLowerCase() === "yes")
    ).length;

    const totalCount = tasks.length;
    const pendingCount = totalCount - completedTasks;
    const completionPercentage = totalCount
      ? Math.round((completedTasks / totalCount) * 100)
      : 0;

    return {
      totalCount,
      completedTasks,
      pendingCount,
      completionPercentage,
    };
  }, [tasks]);

  const StatCard = ({ title, value, icon }) => (
    <div className=" p-2 sm:p-3 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-sky-100 dark:border-gray-800 hover:shadow-md transition-all duration-300 hover:border-sky-300 group">
      <div className="flex items-center gap-2 ">
        <div className=" p-1.5 rounded-lg bg-gradient-to-br from-cyan-500/10 group-hover:from-cyan-500/20 group-hover:to-sky-500/20 ">
          {icon}
        </div>
        <div className=" min-w-0">
          <p className=" text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-500 to-sky-600 bg-clip-text text-transparent">
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        </div>
      </div>
    </div>
  );

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

  console.log("stats", stats);

  const showSidebar = isDashboard && viewMode !== "kanban";

  return (
    <div className=" min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar user={user} onLogout={onLogout} />
      <Sidebar user={user} tasks={tasks} />

      <div className=" ml-0 md:ml-64 pt-16 p-2 sm:p-4 md:p-6 max-w-7xl mx-auto transition-all duration-300 text-gray-900 dark:text-gray-100">
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
        <div className={showSidebar ? "grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6" : "space-y-4"}>
          <div className={showSidebar ? "xl:col-span-2 space-y-3 sm:space-y-4" : "space-y-3 sm:space-y-4 w-full"}>
            <Outlet context={{ tasks, refreshTasks: fetchTasks, viewMode, setViewMode }} />
          </div>
          {showSidebar && (
            <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            <div className=" bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-5 shadow-sm border border-sky-100 dark:border-gray-800">
              <h3 className=" text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <TrendingUp className=" w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />
                Task Statistics
              </h3>
              <div className=" grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <StatCard
                  title="Total Tasks"
                  value={stats.totalCount}
                  icon={
                    <Circle className=" w-3.5 h-3.5 sm:h-4 sm:w-4 text-sky-500" />
                  }
                />
                <StatCard
                  title="Completed"
                  value={stats.completedTasks}
                  icon={
                    <Circle className=" w-3.5 h-3.5 sm:h-4 sm:w-4 text-green-500" />
                  }
                />
                <StatCard
                  title="Pending"
                  value={stats.pendingCount}
                  icon={
                    <Circle className=" w-3.5 h-3.5 sm:h-4 sm:w-4 text-cyan-500" />
                  }
                />
                <StatCard
                  title="Completion Rate"
                  value={` ${stats.totalCount}%`}
                  icon={
                    <Zap className=" w-3.5 h-3.5 sm:h-4 sm:w-4 text-sky-500" />
                  }
                />
              </div>
              <hr className=" my-3 sm:my-4 border-sky-100" />
              <div className=" space-y-2 sm:space-y-3">
                <div className=" flex items-center justify-between text-gray-700">
                  <span className=" text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <Circle className=" w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-500 fill-sky-500" />
                    Task Progress
                  </span>
                  <span className=" text-xs bg-sky-100 text-sky-700 px-1.5 py-0.5 sm:px-2 rounded-full">
                    {stats.completedTasks}/{stats.totalCount}
                  </span>
                </div>
                <div className=" relative pt-1">
                  <div className=" flex gap-1.5 items-center">
                    <div className=" flex-1 h-2 sm:h-3 bg-sky-100 rounded-full overflow-hidden">
                      <div
                        className=" h-full bg-gradient-to-r from-cyan-500 to-sky-600 transition-all duration-500"
                        style={{ width: `${stats.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className=" bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-sky-100">
              <h3 className=" text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 flex items-center gap-2">
                <Clock className=" w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />
                Recent Activity
              </h3>
              <div className=" space-y-2">
                {tasks.slice(0, 3).map((task) => (
                  <div
                    key={task._id || task.id}
                    className=" flex items-center justify-between p-2 sm:p-3 hover:bg-sky-50/50 rounded-lg transition-colors
     duration-200 border border-transparent hover:border-sky-100"
                  >
                    <div className=" flex-1 min-w-0">
                      <p className=" text-sm font-medium text-gray-700 break-words whitespace-normal">
                        {task.title}
                      </p>
                      <p className=" text-xs text-gray-500 mt-0.5">
                        {task.createdAt
                          ? new Date(task.createdAt).toLocaleDateString()
                          : "No Date"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full shrink-0 ml-2 ${
                        task.completed
                          ? "bg-green-100 text-green-700"
                          : "bg-cyan-100 text-cyan-700"
                      }`}
                    >
                      {task.completed ? "Done" : "Pending"}
                    </span>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className=" text-center py-4 sm:py-6 px-2">
                    <div className=" w-12 h-12 sm:w-16 sm:h-16 mx-auto sm:mb-4 rounded-full bg-sky-100 flex items-center justify-center ">
                      <Clock className=" w-6 h-6 sm:w-8 sm:h-8 text-sky-500" />
                    </div>
                    <p className=" text-sm text-gray-500">No recent activity</p>
                    <p className=" text-xs text-gray-400 mt-1">
                      Task will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default Layout;
