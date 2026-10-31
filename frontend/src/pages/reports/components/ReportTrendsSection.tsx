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
  const tooltipStyle = {
    backgroundColor: "#091e42",
    border: "none",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "12px",
    padding: "8px 12px",
    boxShadow: "0 4px 12px rgba(9, 30, 66, 0.25)",
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Grid: Lead Time & Completion Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Item Lead Time */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-lg space-y-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Lead Time by Issue Type
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              Resolution Speed
            </span>
          </div>

          <div className="h-64 w-full text-xs">
            {leadTimeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                No lead time history recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e5e7eb" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#374151" className="hidden dark:block" />
                  <XAxis dataKey="date" stroke="#9ca3af" tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" tickLine={false} tick={{ fontSize: 11 }} unit="d" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Line
                    type="monotone"
                    dataKey="bug"
                    name="Bug"
                    stroke="#ff5630"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#ff5630" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="task"
                    name="Task"
                    stroke="#4c9aff"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#4c9aff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="story"
                    name="Story"
                    stroke="#36b37e"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#36b37e" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Work Item Completion Trend */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-lg space-y-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Completed Work Velocity
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              Throughput
            </span>
          </div>

          <div className="h-64 w-full text-xs">
            {completionTrendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                No resolved work items in selected timeframe
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={completionTrendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barCategoryGap="25%"
                >
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e5e7eb" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#374151" className="hidden dark:block" />
                  <XAxis dataKey="period" stroke="#9ca3af" tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" tickLine={false} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                  <Bar dataKey="task" name="Task" stackId="a" fill="#4c9aff" maxBarSize={36} />
                  <Bar dataKey="bug" name="Bug" stackId="a" fill="#ff5630" maxBarSize={36} />
                  <Bar dataKey="story" name="Story" stackId="a" fill="#36b37e" maxBarSize={36} />
                  <Bar
                    dataKey="epic"
                    name="Epic"
                    stackId="a"
                    fill="#6554c0"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Creation Trend & Cycle Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Item Creation Trend */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-lg space-y-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Created vs Status Intake
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              Intake
            </span>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={creationTrendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barCategoryGap="25%"
              >
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e5e7eb" className="dark:hidden" />
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#374151" className="hidden dark:block" />
                <XAxis dataKey="period" stroke="#9ca3af" tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tickLine={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                <Bar dataKey="todo" name="To Do" stackId="s" fill="#4c9aff" maxBarSize={36} />
                <Bar dataKey="inProgress" name="In Progress" stackId="s" fill="#ffab00" maxBarSize={36} />
                <Bar dataKey="done" name="Done" stackId="s" fill="#36b37e" maxBarSize={36} />
                <Bar
                  dataKey="reopen"
                  name="Reopen"
                  stackId="s"
                  fill="#6554c0"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Work Item Cycle Time */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-lg space-y-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Resolution Cycle Time
            </h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              Cycle Efficiency
            </span>
          </div>

          <div className="h-64 w-full text-xs">
            {cycleTimeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                No cycle time history recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cycleTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#e5e7eb" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#374151" className="hidden dark:block" />
                  <XAxis dataKey="date" stroke="#9ca3af" tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9ca3af" tickLine={false} tick={{ fontSize: 11 }} unit="d" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: any, _name: any, item: any) => [
                      `${value} days (${item?.payload?.key || ""})`,
                      "Cycle Time",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="cycleTime"
                    name="Cycle Time (days)"
                    stroke="#0052cc"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#0052cc" }}
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
