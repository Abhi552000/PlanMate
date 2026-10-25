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
  totalTasks,
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

    return (
      <div className="bg-white dark:bg-gray-900/60 border border-sky-100/70 dark:border-gray-800 p-5 rounded-2xl shadow-xs flex flex-col justify-between backdrop-blur-xs">
        {/* Title */}
        <div className="flex items-center justify-between pb-3 border-b border-sky-50 dark:border-gray-800/80">
          <h3 className="text-sm font-bold text-gray-850 dark:text-gray-200">{title}</h3>
          <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded">
            {data.length} categories
          </span>
        </div>

        {/* Donut Chart with Center Label */}
        <div className="relative w-full h-56 my-2 flex items-center justify-center">
          {data.length === 0 ? (
            <div className="text-xs text-gray-400">No data available</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    onClick={(entry) => onSliceClick?.(category, entry.name)}
                    className="cursor-pointer focus:outline-none"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderColor: "rgba(56, 189, 248, 0.2)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                  {formatTotal(cardTotal)}
                </span>
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                  Total value
                </span>
              </div>
            </>
          )}
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 border-t border-sky-50 dark:border-gray-800/80 max-h-24 overflow-y-auto scrollbar-thin">
          {data.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSliceClick?.(category, item.name)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-gray-50 dark:bg-gray-800/60 hover:bg-sky-50 dark:hover:bg-gray-700/60 text-gray-700 dark:text-gray-300 transition-colors border border-gray-100 dark:border-gray-750 cursor-pointer"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate max-w-[90px]">{item.name}</span>
              <span className="text-[10px] text-gray-400 font-bold ml-0.5">({item.value})</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {renderDonutCard("Work items by status", statusData, "status")}
      {renderDonutCard("Work items by type", typeData, "type")}
      {renderDonutCard("Work items by assignee", assigneeData, "assignee")}
    </div>
  );
};
