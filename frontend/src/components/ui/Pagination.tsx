import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGINATION_TEXTS } from "../../constants/uiTexts";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  showItemCount?: boolean;
  hideOnSinglePage?: boolean;
}

export const Pagination: React.FC<PaginationProps> = React.memo(
  ({
    currentPage,
    totalPages,
    totalItems,
    pageSize = 10,
    itemLabel = "items",
    onPageChange,
    disabled = false,
    className = "",
    showItemCount = true,
    hideOnSinglePage = false,
  }) => {
    // Compute effective page numbers with smart ellipsis windowing
    const effectiveTotalPages = Math.max(1, totalPages);
    const pageNumbers = useMemo<(number | string)[]>(() => {
      if (effectiveTotalPages <= 7) {
        return Array.from({ length: effectiveTotalPages }, (_, i) => i + 1);
      }

      if (currentPage <= 4) {
        return [1, 2, 3, 4, 5, "...", effectiveTotalPages];
      }

      if (currentPage >= effectiveTotalPages - 3) {
        return [
          1,
          "...",
          effectiveTotalPages - 4,
          effectiveTotalPages - 3,
          effectiveTotalPages - 2,
          effectiveTotalPages - 1,
          effectiveTotalPages,
        ];
      }

      return [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        effectiveTotalPages,
      ];
    }, [currentPage, effectiveTotalPages]);

    // If no items at all, hide pagination footer
    if (totalItems === 0 || totalPages <= 0) {
      return null;
    }

    // If hideOnSinglePage is requested and there's at most 1 page
    if (hideOnSinglePage && totalPages <= 1) {
      return null;
    }

    // Compute item ranges for the counter text
    const startItem = totalItems !== undefined ? (totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1) : 0;
    const endItem = totalItems !== undefined ? Math.min(currentPage * pageSize, totalItems) : 0;

    return (
      <div
        className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20 text-xs ${className}`}
      >
        {/* Left: Summary Counter */}
        {showItemCount && (
          <div className="text-slate-500 dark:text-slate-400 font-medium">
            {totalItems !== undefined ? (
              totalItems > 0 ? (
                <>
                  {PAGINATION_TEXTS.SHOWING} <span className="font-bold text-slate-700 dark:text-slate-200">{startItem}</span> {PAGINATION_TEXTS.TO}{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-200">{endItem}</span> {PAGINATION_TEXTS.OF}{" "}
                  <span className="font-bold text-slate-700 dark:text-slate-200">{totalItems}</span> {itemLabel}
                </>
              ) : (
                <>No {itemLabel} found</>
              )
            ) : (
              <>
                {PAGINATION_TEXTS.PAGE} <span className="font-bold text-slate-700 dark:text-slate-200">{currentPage}</span> {PAGINATION_TEXTS.OF}{" "}
                <span className="font-bold text-slate-700 dark:text-slate-200">{totalPages}</span>
              </>
            )}
          </div>
        )}

        {/* Right: Page Buttons */}
        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
          {/* Previous Button */}
          <button
            type="button"
            disabled={currentPage <= 1 || disabled}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="h-8 px-2.5 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            title="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{PAGINATION_TEXTS.PREVIOUS}</span>
          </button>

          {/* Page Numbers */}
          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-bold select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                disabled={disabled}
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 rounded-lg border text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                  isActive
                    ? "bg-sky-500 border-sky-500 text-white"
                    : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Next Button */}
          <button
            type="button"
            disabled={currentPage >= totalPages || disabled}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="h-8 px-2.5 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            title="Next page"
          >
            <span className="hidden sm:inline">{PAGINATION_TEXTS.NEXT}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }
);

Pagination.displayName = "Pagination";
