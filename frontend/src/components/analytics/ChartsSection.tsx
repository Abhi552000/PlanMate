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

// Custom dark/light mode responsive chart tooltip
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-lg p-3 text-xs min-w-[140px] z-50">
        {label && (
          <p className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2">
            {label}
          </p>
        )}
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color || entry.stroke || entry.fill }}
                />
                {entry.name}:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Progress Timeline Trend (Burndown) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/70 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Remaining Workload Trend
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60 self-start sm:self-auto">
              Last 15 Days
            </span>
          </div>

          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burndownData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: "600", paddingTop: "10px" }} />
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
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (Pie/Donut Chart) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/70 pb-3.5">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Tasks by Priority</h3>
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
                      innerRadius={48}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {priorityBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Total task label in center of donut */}
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                    {metrics.totalCount}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">
                    Total
                  </span>
                </div>
              </div>

              {/* Priority list details */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                {priorityBreakdown.map((p) => {
                  const percent = metrics.totalCount > 0 ? Math.round((p.value / metrics.totalCount) * 100) : 0;
                  return (
                    <div key={p.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{p.name}</span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 font-bold text-[11px]">
                        {p.value} {p.value === 1 ? "task" : "tasks"} ({percent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-xs text-slate-400 italic">No tasks with set priority levels.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cumulative Flow Diagram (CFD) */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/70 pb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Cumulative Flow Diagram (CFD)
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                Work-in-progress flow & backlog stability over time
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60 self-start sm:self-auto">
            Last 7 Days
          </span>
        </div>

        <div className="h-72 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cfdData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
              <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", fontWeight: "600", paddingTop: "10px" }} />
              <Area type="monotone" dataKey="To Do" stackId="1" stroke="#f97316" fill="#fed7aa" fillOpacity={0.6} />
              <Area type="monotone" dataKey="In Progress" stackId="1" stroke="#0ea5e9" fill="#bae6fd" fillOpacity={0.6} />
              <Area type="monotone" dataKey="Done" stackId="1" stroke="#10b981" fill="#a7f3d0" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Sprint Velocity Chart */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/70 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
                <BarChart2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Sprint Velocity</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  Story Points: Committed vs Delivered
                </p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full text-xs">
            {sprintVelocityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sprintVelocityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend iconType="rect" wrapperStyle={{ fontSize: "11px", fontWeight: "600", paddingTop: "10px" }} />
                  <Bar dataKey="committed" fill="#0ea5e9" name="Committed Points" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" name="Completed Points" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center">
                <p className="text-xs text-slate-400 italic">
                  No sprint-linked tasks found. Assign tasks to sprints to track velocity.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Completion Rate Chart */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 rounded-2xl shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/70 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Weekly Delivery Trend
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  Points earned vs tasks completed per week
                </p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="hidden dark:block" />
                <XAxis dataKey="Week" stroke="#94a3b8" tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend iconType="rect" wrapperStyle={{ fontSize: "11px", fontWeight: "600", paddingTop: "10px" }} />
                <Bar dataKey="Points Earned" fill="#6366f1" name="Story Points Earned" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Tasks Completed" fill="#10b981" name="Tasks Done" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
