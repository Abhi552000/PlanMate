import React from "react";
import { Plus, HomeIcon, Inbox, Flame } from "lucide-react";
import { ADD_BUTTON, HEADER, ICON_WRAPPER, LABEL_CLASS, STAT_CARD, STATS_GRID, VALUE_CLASS } from "../../../assets/dummy";
import { DashboardHeaderProps } from "../../../types";

const STATS_CONFIG = [
  {
    key: "total",
    label: "Total Tasks",
    icon: Inbox,
    iconColor: "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400",
    borderColor: "border-sky-100/50 dark:border-gray-800",
    valueKey: "total" as const,
  },
  {
    key: "lowPriority",
    label: "Low Priority",
    icon: Flame,
    iconColor: "bg-gray-50 dark:bg-gray-800/60 text-gray-505 dark:text-gray-400",
    borderColor: "border-sky-100/50 dark:border-gray-800",
    valueKey: "lowPriority" as const,
  },
  {
    key: "mediumPriority",
    label: "Medium Priority",
    icon: Flame,
    iconColor: "bg-gray-50 dark:bg-gray-800/60 text-gray-505 dark:text-gray-400",
    borderColor: "border-sky-100/50 dark:border-gray-800",
    valueKey: "mediumPriority" as const,
  },
  {
    key: "highPriority",
    label: "High Priority",
    icon: Flame,
    iconColor: "bg-gray-50 dark:bg-gray-800/60 text-gray-505 dark:text-gray-400",
    borderColor: "border-sky-100/50 dark:border-gray-800",
    valueKey: "highPriority" as const,
  },
];

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalTasks,
  lowPriority,
  mediumPriority,
  highPriority,
  onAddTask,
}) => {
  const statsValues = {
    total: totalTasks,
    lowPriority,
    mediumPriority,
    highPriority,
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className={HEADER}>
        <div className=" min-w-0">
          <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <HomeIcon className=" text-sky-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className=" truncate">Task Overview</span>
          </h1>
          <p className=" text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7 truncate">
            Manage your tasks efficiently
          </p>
        </div>
        <button onClick={onAddTask} className={ADD_BUTTON}>
          <Plus size={18} />
          Add New Task
        </button>
      </div>

      {/* STATS */}
      <div className={STATS_GRID}>
        {STATS_CONFIG.map(
          ({
            key,
            label,
            icon: Icon,
            iconColor,
            borderColor,
            valueKey,
          }) => (
            <div key={key} className={`${STAT_CARD} ${borderColor} dark:bg-gray-900/40 backdrop-blur-sm`}>
              <div className=" flex items-center gap-2 md:gap-3">
                <div className={`${ICON_WRAPPER} ${iconColor}`}>
                  <Icon className=" w-4 h-4 md:w-5 md:h-5" />
                </div>

                <div className=" min-w-0">
                  <p className={`${VALUE_CLASS} text-gray-850 dark:text-gray-100 font-bold`}>
                    {statsValues[valueKey]}
                  </p>
                  <p className={LABEL_CLASS}>{label}</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
