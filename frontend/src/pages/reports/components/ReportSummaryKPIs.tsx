import React from "react";
import { CheckCircle2, Clock, PlusSquare, Calendar } from "lucide-react";
import { IReportKPIs } from "../utils/reportCalculations";

interface ReportSummaryKPIsProps {
  kpis: IReportKPIs;
  onFilterClick?: (filterType: string) => void;
}

export const ReportSummaryKPIs: React.FC<ReportSummaryKPIsProps> = ({ kpis, onFilterClick }) => {
  const isAllTime = kpis.timeframe === "all";
  const is30d = kpis.timeframe === "30d";

  const cards = [
    {
      id: "completed",
      title: "Resolved",
      count: kpis.completedCount,
      subtitle: isAllTime
        ? `${kpis.completionRate} resolution rate (${kpis.completedCount} of ${kpis.totalCount})`
        : is30d
        ? "Resolved in last 30 days"
        : "Resolved this week",
      icon: CheckCircle2,
      iconColor:
        "text-[#36b37e] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60",
    },
    {
      id: "inProgress",
      title: kpis.inProgressCount > 0 ? "In Progress" : "Open Work",
      count: kpis.inProgressCount > 0 ? kpis.inProgressCount : kpis.openCount,
      subtitle: isAllTime
        ? kpis.inProgressCount > 0
          ? "Under active development"
          : "Unresolved backlog & sprint items"
        : is30d
        ? "Active in last 30 days"
        : "Active this week",
      icon: Clock,
      iconColor:
        "text-[#ffab00] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60",
    },
    {
      id: "created",
      title: "Created",
      count: kpis.createdCount,
      subtitle: isAllTime
        ? "Total intake logged in project"
        : is30d
        ? "Created in last 30 days"
        : "Created this week",
      icon: PlusSquare,
      iconColor:
        "text-[#0052cc] bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60",
    },
    {
      id: "due",
      title: "Due Soon",
      count: kpis.dueCount,
      subtitle: isAllTime
        ? "Active items with due date"
        : is30d
        ? "Due in next 30 days"
        : "Due within next 7 days",
      icon: Calendar,
      iconColor:
        "text-[#ff5630] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60",
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
            className="p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Top row: Title + Jira Icon */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-md shrink-0 ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Metric Value */}
            <div className="my-2.5">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {card.count}
              </span>
            </div>

            {/* Insight / Helper */}
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-normal">
              {card.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};
