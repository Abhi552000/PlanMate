import React from "react";
import { CheckCircle2, Edit3, PlusSquare, Calendar } from "lucide-react";
import { IReportKPIs } from "../utils/reportCalculations";

interface ReportSummaryKPIsProps {
  kpis: IReportKPIs;
  onFilterClick?: (filterType: string) => void;
}

export const ReportSummaryKPIs: React.FC<ReportSummaryKPIsProps> = ({ kpis, onFilterClick }) => {
  const cards = [
    {
      id: "completed",
      count: kpis.completedLast7Days,
      label: "work items completed in the last 7 days",
      icon: CheckCircle2,
      iconColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60",
      borderColor: "border-emerald-100/80 dark:border-gray-800",
    },
    {
      id: "updated",
      count: kpis.updatedLast7Days,
      label: "work items updated in the last 7 days",
      icon: Edit3,
      iconColor: "text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60",
      borderColor: "border-sky-100/80 dark:border-gray-800",
    },
    {
      id: "created",
      count: kpis.createdLast7Days,
      label: "work items created in the last 7 days",
      icon: PlusSquare,
      iconColor: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/60",
      borderColor: "border-cyan-100/80 dark:border-gray-800",
    },
    {
      id: "due",
      count: kpis.dueNext7Days,
      label: "work items due in the next 7 days",
      icon: Calendar,
      iconColor: "text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60",
      borderColor: "border-rose-100/80 dark:border-gray-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onFilterClick?.(card.id)}
            className={`p-4 rounded-xl bg-white dark:bg-gray-900/60 border ${card.borderColor} shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-3.5 cursor-pointer group backdrop-blur-xs`}
          >
            <div className={`p-2 rounded-lg border shrink-0 ${card.iconColor} group-hover:scale-105 transition-transform`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                {card.count} {card.label.split(" ")[0]}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {card.label.replace(/^\w+\s/, "")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
