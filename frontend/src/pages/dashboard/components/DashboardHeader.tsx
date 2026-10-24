import React from "react";
import { Plus, HomeIcon } from "lucide-react";
import {
  ADD_BUTTON,
  HEADER,
  ICON_WRAPPER,
  LABEL_CLASS,
  STAT_CARD,
  STATS_GRID,
  VALUE_CLASS,
} from "../../../assets/dummy";
import { DashboardHeaderProps } from "../../../types";
import { STATS_CONFIG } from "../../../constants/uiTexts";

export const DashboardHeader: React.FC<DashboardHeaderProps> = React.memo(({
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
    <div className="space-y-4 sm:space-y-6">
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
          ({ key, label, icon: Icon, iconColor, borderColor, valueKey }) => (
            <div
              key={key}
              className={`${STAT_CARD} ${borderColor} dark:bg-gray-900/40 backdrop-blur-sm`}
            >
              <div className=" flex items-center gap-2 md:gap-3">
                <div className={`${ICON_WRAPPER} ${iconColor}`}>
                  <Icon className=" w-4 h-4 md:w-5 md:h-5" />
                </div>

                <div className=" min-w-0">
                  <p
                    className={`${VALUE_CLASS} text-gray-850 dark:text-gray-100 font-bold`}
                  >
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
});
