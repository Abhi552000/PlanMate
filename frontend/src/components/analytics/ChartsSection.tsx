import React, { useMemo } from "react";
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
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity, BarChart2 } from "lucide-react";

import { ChartsSectionProps } from "../../types";
import { getSprintVelocityData, getCFDData } from "./helpers";

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  burndownData,
  priorityBreakdown,
  metrics,
  weeklyData,
  tasks = [],
}) => {
  // Calculate Agile velocity and CFD data on the fly from tasks
  const sprintVelocityData = useMemo(() => getSprintVelocityData(tasks), [tasks]);
  const cfdData = useMemo(() => getCFDData(tasks), [tasks]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress Timeline Trend */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-50 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-500" />
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Remaining Workload Trend</h3>
            </div>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded border border-sky-100/50 dark:border-gray-700">
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
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Tasks by Priority</h3>
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
                  <span className="text-lg font-black text-gray-800 dark:text-gray-100">{metrics.totalCount}</span>
                  <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Total</span>
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
                        <span className="font-bold text-gray-700 dark:text-gray-300">{p.name}</span>
                      </div>
                      <span className="text-gray-500 font-extrabold text-[11px]">
                        {p.value} {p.value === 1 ? "task" : "tasks"} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-xs text-gray-400 italic">No tasks with set priority levels.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cumulative Flow Diagram (CFD) */}
      <div className="bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-50 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Cumulative Flow Diagram (CFD)</h3>
          </div>
          <span className="text-[10px] font-bold text-gray-500 bg-gray-55 dark:bg-gray-800 px-2 py-0.5 rounded border border-sky-100/50 dark:border-gray-700">
            Flow (Last 7 Days)
          </span>
        </div>

        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cfdData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="hidden dark:block" />
              <XAxis dataKey="day" stroke="#9ca3af" tickLine={false} />
              <YAxis stroke="#9ca3af" tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(224,242,254,0.8)",
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: "semibold", paddingTop: "10px" }} />
              <Area type="monotone" dataKey="To Do" stackId="1" stroke="#ea580c" fill="#ffedd5" className="dark:fill-orange-950/20" />
              <Area type="monotone" dataKey="In Progress" stackId="1" stroke="#3b82f6" fill="#dbeafe" className="dark:fill-blue-955/20" />
              <Area type="monotone" dataKey="Done" stackId="1" stroke="#10b981" fill="#d1fae5" className="dark:fill-emerald-955/20" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sprint Velocity Chart */}
        <div className="bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-50 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-sky-500" />
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Sprint Velocity</h3>
            </div>
            <span className="text-[10px] text-gray-400 font-semibold">Story Points Completed vs Committed</span>
          </div>

          <div className="h-72 w-full text-xs">
            {sprintVelocityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sprintVelocityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} />
                  <YAxis stroke="#9ca3af" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid rgba(224,242,254,0.8)",
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                    }}
                  />
                  <Legend iconType="rect" wrapperStyle={{ fontSize: "11px", fontWeight: "semibold", paddingTop: "10px" }} />
                  <Bar dataKey="committed" fill="#3b82f6" name="Committed Points" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" name="Completed Points" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-400 italic">No sprints found. Assign tasks to sprints to measure velocity.</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Completion Rate Chart */}
        <div className="bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-50 dark:border-gray-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-sky-500" />
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Weekly Completion Rate</h3>
            </div>
            <span className="text-[10px] text-gray-400 font-semibold">Points Earned vs Tasks Resolved</span>
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
      </div>
    </div>
  );
};
