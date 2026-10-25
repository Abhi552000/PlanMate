import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  ILeadTimePoint,
  ICompletionTrendPoint,
  ICycleTimePoint,
  ICreationTrendPoint,
} from "../utils/reportCalculations";

interface ReportTrendsSectionProps {
  leadTimeData: ILeadTimePoint[];
  completionTrendData: ICompletionTrendPoint[];
  cycleTimeData: ICycleTimePoint[];
  creationTrendData: ICreationTrendPoint[];
}

export const ReportTrendsSection: React.FC<ReportTrendsSectionProps> = ({
  leadTimeData,
  completionTrendData,
  cycleTimeData,
  creationTrendData,
}) => {
  return (
    <div className="space-y-6">
      {/* 2-Column Grid: Lead Time & Completion Trend (Screenshot 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Item Lead Time */}
        <div className="bg-white dark:bg-gray-900/60 border border-sky-100/70 dark:border-gray-800 p-5 rounded-2xl shadow-xs space-y-4 backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-850 dark:text-gray-200">
                Work item lead time
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Average cycle time (days) vs creation date</p>
            </div>
            <span className="text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-100 dark:border-sky-900/30">
              By Issue Type
            </span>
          </div>

          <div className="h-64 w-full text-xs">
            {leadTimeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                No lead time history yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="hidden dark:block" />
                  <XAxis dataKey="date" stroke="#9ca3af" tickLine={false} />
                  <YAxis stroke="#9ca3af" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderColor: "rgba(56, 189, 248, 0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Line
                    type="monotone"
                    dataKey="bug"
                    name="Bug"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#f43f5e" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="task"
                    name="Task"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#0ea5e9" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="story"
                    name="Story"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#10b981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Work Item Completion Trend */}
        <div className="bg-white dark:bg-gray-900/60 border border-sky-100/70 dark:border-gray-800 p-5 rounded-2xl shadow-xs space-y-4 backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-850 dark:text-gray-200">
                Work item completion trend
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Completed work items by resolution period</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">
              Resolved Output
            </span>
          </div>

          <div className="h-64 w-full text-xs">
            {completionTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                No completed work items recorded
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="hidden dark:block" />
                  <XAxis dataKey="period" stroke="#9ca3af" tickLine={false} />
                  <YAxis stroke="#9ca3af" tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderColor: "rgba(56, 189, 248, 0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="task" name="Task" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="bug" name="Bug" stackId="a" fill="#f43f5e" />
                  <Bar dataKey="story" name="Story" stackId="a" fill="#10b981" />
                  <Bar dataKey="epic" name="Epic" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Creation Trend & Cycle Time (Screenshot 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Item Creation Trend */}
        <div className="bg-white dark:bg-gray-900/60 border border-sky-100/70 dark:border-gray-800 p-5 rounded-2xl shadow-xs space-y-4 backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-850 dark:text-gray-200">
                Work item creation trend
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Throughput intake stacked by current status</p>
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-100 dark:border-amber-900/30">
              Intake
            </span>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={creationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="hidden dark:block" />
                <XAxis dataKey="period" stroke="#9ca3af" tickLine={false} />
                <YAxis stroke="#9ca3af" tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderColor: "rgba(56, 189, 248, 0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="todo" name="To Do" stackId="s" fill="#38bdf8" />
                <Bar dataKey="inProgress" name="In Progress" stackId="s" fill="#f59e0b" />
                <Bar dataKey="done" name="Done" stackId="s" fill="#10b981" />
                <Bar dataKey="reopen" name="Reopen" stackId="s" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Work Item Cycle Time */}
        <div className="bg-white dark:bg-gray-900/60 border border-sky-100/70 dark:border-gray-800 p-5 rounded-2xl shadow-xs space-y-4 backdrop-blur-xs">
          <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-850 dark:text-gray-200">
                Work item cycle time
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">Days taken from start to completion</p>
            </div>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-900/30">
              Resolution Speed
            </span>
          </div>

          <div className="h-64 w-full text-xs">
            {cycleTimeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                No cycle time history yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cycleTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" className="hidden dark:block" />
                  <XAxis dataKey="date" stroke="#9ca3af" tickLine={false} />
                  <YAxis stroke="#9ca3af" tickLine={false} unit="d" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      borderColor: "rgba(56, 189, 248, 0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(value: any, name: any, item: any) => [
                      `${value} days (${item?.payload?.key || ""})`,
                      "Cycle Time",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="cycleTime"
                    name="Cycle Time (days)"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#6366f1" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
