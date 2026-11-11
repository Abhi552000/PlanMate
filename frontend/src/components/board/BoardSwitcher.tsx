import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Layers } from "lucide-react";
import { useBoard } from "../../context/BoardContext";
import { BoardEnvironment } from "../../types";

export const BoardSwitcher: React.FC = () => {
  const { boards, currentBoard, setCurrentBoard } = useBoard();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderBadge = (env: BoardEnvironment) => {
    return (
      <span
        className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 tracking-wider shrink-0"
      >
        {env}
      </span>
    );
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Minimal Navbar Selector Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 transition-colors text-xs font-medium cursor-pointer"
        aria-label="Switch Board"
        title="Select Active Board"
      >
        <Layers className="w-3.5 h-3.5 text-sky-500 shrink-0" />
        <span className="font-semibold text-slate-900 dark:text-white max-w-[140px] truncate">
          {currentBoard?.name || "Select Board"}
        </span>
        {currentBoard?.key && (
          <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500">
            [{currentBoard.key}]
          </span>
        )}
        {currentBoard?.environment && renderBadge(currentBoard.environment)}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Simple, Minimal Options Dropdown */}
      {open && (
        <div className="absolute left-0 mt-1 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/70">
            Boards ({boards.length})
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {boards.map((b) => {
              const isSelected = currentBoard?._id === b._id;
              return (
                <button
                  key={b._id}
                  type="button"
                  onClick={() => {
                    setCurrentBoard(b);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 font-semibold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="font-mono font-bold text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                      {b.key}
                    </span>
                    <span className="truncate">{b.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {renderBadge(b.environment)}
                    {isSelected && <Check className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                  </div>
                </button>
              );
            })}

            {boards.length === 0 && (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                No boards available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
