import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { taskService } from "../services/taskService";
import { Activity, Flame, TrendingUp, BarChart2 } from "lucide-react";
import { toast } from "react-toastify";

interface AnalyticsData {
  weeks: { label: string; points: number; count: number }[];
  burndown: { day: string; ideal: number; remaining: number }[];
  priorityBreakdown: { High: number; Medium: number; Low: number };
}

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await taskService.getAnalytics();
        if (res.success && res.analytics) {
          setData(res.analytics);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load workspace analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-semibold">Loading dashboard metrics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl">
        <p className="text-gray-500 text-sm italic">No analytics data available in this workspace yet.</p>
      </div>
    );
  }

  // Formatting Priority data for Pie chart
  const priorityData = [
    { name: "High", value: data.priorityBreakdown.High, color: "#ef4444" },
    { name: "Medium", value: data.priorityBreakdown.Medium, color: "#f59e0b" },
    { name: "Low", value: data.priorityBreakdown.Low, color: "#10b981" },
  ].filter(p => p.value > 0);

  return (
    <div className="space-y-6 w-full font-sans pb-10">
      {/* Visual Analytics Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-xl">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ideal vs Remaining</h4>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-0.5">
              {data.burndown[data.burndown.length - 1]?.remaining || 0} Story Points Left
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-50 dark:bg-sky-950/20 text-sky-500 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weekly Velocity</h4>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-0.5">
              {data.weeks[data.weeks.length - 1]?.points || 0} Story Points (Week -0)
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-500 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tasks Solved (Weekly)</h4>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-0.5">
              {data.weeks[data.weeks.length - 1]?.count || 0} Issues Resolved
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Burndown Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-sky-50 dark:border-gray-800 pb-3">
            <Flame className="w-5 h-5 text-red-500" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250">Sprint Burndown Curve (Last 15 Days)</h3>
          </div>
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.burndown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="hidden dark:block" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: "16px", 
                    border: "1px solid rgba(224,242,254,0.6)", 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)" 
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="ideal" stroke="#9ca3af" strokeDasharray="5 5" name="Ideal Burndown" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="remaining" stroke="#0ea5e9" name="Remaining Scope" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (Pie Chart) */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-sky-50 dark:border-gray-800 pb-3">
            <BarChart2 className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250">Priority Allocation</h3>
          </div>
          {priorityData.length > 0 ? (
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-xs text-gray-400 italic">No tasks with set priority.</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Velocity Chart */}
      <div className="bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-sky-50 dark:border-gray-800 pb-3">
          <TrendingUp className="w-5 h-5 text-sky-500" />
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250">Weekly Velocity Trend</h3>
        </div>
        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weeks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="hidden dark:block" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "16px", 
                  border: "1px solid rgba(224,242,254,0.6)" 
                }} 
              />
              <Legend />
              <Bar dataKey="points" fill="#0ea5e9" name="Story Points Resolved" radius={[4, 4, 0, 0]} />
              <Bar dataKey="count" fill="#10b981" name="Task Count Solved" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
