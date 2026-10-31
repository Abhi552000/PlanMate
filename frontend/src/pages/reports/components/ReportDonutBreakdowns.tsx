import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { IDonutItem } from "../utils/reportCalculations";

interface ReportDonutBreakdownsProps {
  statusData: IDonutItem[];
  typeData: IDonutItem[];
  assigneeData: IDonutItem[];
  totalTasks: number;
  onSliceClick?: (category: "status" | "type" | "assignee", value: string) => void;
}

export const ReportDonutBreakdowns: React.FC<ReportDonutBreakdownsProps> = ({
  statusData,
  typeData,
  assigneeData,
  onSliceClick,
}) => {
  const formatTotal = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return `${num}`;
  };

  const renderDonutCard = (
    title: string,
    data: IDonutItem[],
    category: "status" | "type" | "assignee"
  ) => {
    const cardTotal = data.reduce((sum, item) => sum + item.value, 0);
    const categorySuffix =
      category === "assignee" ? "assignees" : category === "status" ? "statuses" : "types";

    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-lg flex flex-col justify-between hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
        {/* Title & Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {data.length} {categorySuffix}
          </span>
        </div>

        {/* Donut Chart with Center Label */}
        <div className="relative w-full h-56 my-2 flex items-center justify-center">
          {data.length === 0 ? (
            <div className="text-xs text-gray-400">No issues available</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={{ outline: "none" }} className="focus:outline-none focus:ring-0 [&_*]:focus:outline-none">
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={86}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={(entry) => onSliceClick?.(category, entry.name)}
                    className="cursor-pointer outline-none focus:outline-none"
                    style={{ outline: "none" }}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="hover:opacity-85 transition-opacity outline-none focus:outline-none"
                        style={{ outline: "none" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#091e42",
                      borderColor: "#091e42",
                      borderRadius: "6px",
                      color: "#ffffff",
                      fontSize: "12px",
                      padding: "6px 10px",
                      boxShadow: "0 4px 12px rgba(9, 30, 66, 0.25)",
                    }}
                    itemStyle={{ color: "#ffffff" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Counter: Jira style */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  {formatTotal(cardTotal)}
                </span>
                <span className="text-[11px] font-medium tracking-wider text-gray-500 uppercase mt-0.5">
                  Issues
                </span>
              </div>
            </>
          )}
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-800 max-h-24 overflow-y-auto scrollbar-thin">
          {data.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSliceClick?.(category, item.name)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors border border-gray-200/60 dark:border-gray-700/60 cursor-pointer"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate max-w-[95px]">{item.name}</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal ml-0.5">
                ({item.value})
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {renderDonutCard("Issues by Status", statusData, "status")}
      {renderDonutCard("Issues by Type", typeData, "type")}
      {renderDonutCard("Issues by Assignee", assigneeData, "assignee")}
    </div>
  );
};
