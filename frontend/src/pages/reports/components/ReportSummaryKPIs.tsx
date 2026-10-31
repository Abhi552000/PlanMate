import React from "react";
import { CheckCircle2, Clock, PlusSquare, Calendar } from "lucide-react";
import { IReportKPIs, ReportSummaryKPIsProps } from "../../../types";
import {
  STAT_CARD,
  STATS_GRID,
  ICON_WRAPPER,
  VALUE_CLASS,
  LABEL_CLASS,
} from "../../../assets/dummy";

export const ReportSummaryKPIs: React.FC<ReportSummaryKPIsProps> = ({ kpis, onFilterClick }) => {
  const cards = [
    {
      id: "completed",
      label: "Resolved",
      count: kpis.completedCount,
      icon: CheckCircle2,
      iconColor: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
      borderColor: "border-emerald-100 dark:border-emerald-900/50",
    },
    {
      id: "inProgress",
      label: kpis.inProgressCount > 0 ? "In Progress" : "Open Work",
      count: kpis.inProgressCount > 0 ? kpis.inProgressCount : kpis.openCount,
      icon: Clock,
      iconColor: "bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
      borderColor: "border-amber-100 dark:border-amber-900/50",
    },
    {
      id: "created",
      label: "Created",
      count: kpis.createdCount,
      icon: PlusSquare,
      iconColor: "bg-sky-100 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
      borderColor: "border-sky-100 dark:border-sky-900/50",
    },
    {
      id: "due",
      label: "Due Soon",
      count: kpis.dueCount,
      icon: Calendar,
      iconColor: "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
      borderColor: "border-rose-100 dark:border-rose-900/50",
    },
  ];

  return (
    <div className={STATS_GRID}>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onFilterClick?.(card.id)}
            className={`${STAT_CARD} ${card.borderColor} dark:bg-gray-900/60 backdrop-blur-sm hover:border-opacity-100 transition-all cursor-pointer`}
          >
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`${ICON_WRAPPER} ${card.iconColor}`}>
                <Icon className="w-4 h-4 md:w-5 md:h-5" />
              </div>

              <div className="min-w-0">
                <p
                  className={`${VALUE_CLASS} text-gray-900 dark:text-gray-100 font-bold`}
                >
                  {card.count}
                </p>
                <p className={LABEL_CLASS}>{card.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
