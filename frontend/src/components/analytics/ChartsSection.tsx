import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from "lucide-react";

import { ChartsSectionProps } from "../../types";

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  burndownData,
  priorityBreakdown,
  metrics,
  weeklyData,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress Timeline Trend */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-50 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-255">Remaining Workload Trend</h3>
            </div>
            <span className="text-[10px] font-bold text-gray-405 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded border border-sky-100/50 dark:border-gray-700">
              Last 15 Days
            </span>
          </div>

          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burndownData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="hidden dark:block" />
                <XAxis dataKey="day" stroke="#9ca3af" tickLine={false} />
                <YAxis stroke="#9ca3af" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(224,242,254,0.8)",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                  itemStyle={{ fontSize: "11px", fontWeight: "bold" }}
                  labelStyle={{ fontWeight: "extrabold", color: "#374151", marginBottom: "4px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: "semibold", paddingTop: "10px" }} />
                <Area
                  type="monotone"
                  dataKey="Remaining Points"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRemaining)"
                />
                <Area
                  type="monotone"
                  dataKey="Ideal Burn Target"
                  stroke="#9ca3af"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (Pie Chart) */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 border-b border-sky-50 dark:border-gray-800 pb-3">
            <PieChartIcon className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-255">Tasks by Priority</h3>
          </div>

          {priorityBreakdown.length > 0 ? (
            <div className="space-y-4">
              <div className="h-44 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {priorityBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid rgba(224,242,254,0.8)",
                        fontSize: "11px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Total task label in center of donut */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-gray-805 dark:text-gray-100">{metrics.totalCount}</span>
                  <span className="text-[9px] text-gray-405 uppercase font-bold tracking-wider">Total</span>
                </div>
              </div>

              {/* Priority list details */}
              <div className="space-y-2 pt-2">
                {priorityBreakdown.map((p) => {
                  const percent = Math.round((p.value / metrics.totalCount) * 100);
                  return (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="font-bold text-gray-750 dark:text-gray-300">{p.name}</span>
                      </div>
                      <span className="text-gray-450 font-extrabold text-[11px]">
                        {p.value} {p.value === 1 ? "task" : "tasks"} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-xs text-gray-450 italic">No tasks with set priority levels.</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Velocity Chart */}
      <div className="bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-50 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-255">Weekly Completion Rate</h3>
          </div>
          <p className="text-[10px] text-gray-404 dark:text-gray-500 font-semibold">
            Comparison of points completed vs tasks resolved
          </p>
        </div>

        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="hidden dark:block" />
              <XAxis dataKey="Week" stroke="#9ca3af" tickLine={false} />
              <YAxis stroke="#9ca3af" tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(224,242,254,0.8)",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                }}
                itemStyle={{ fontSize: "11px", fontWeight: "bold" }}
                labelStyle={{ fontWeight: "extrabold", color: "#374151" }}
              />
              <Legend iconType="rect" wrapperStyle={{ fontSize: "11px", fontWeight: "semibold", paddingTop: "10px" }} />
              <Bar dataKey="Points Earned" fill="#0ea5e9" name="Story Points Earned" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Tasks Completed" fill="#10b981" name="Tasks Done (Count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};
