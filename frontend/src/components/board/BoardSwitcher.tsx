import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useBoard } from "../../context/BoardContext";

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

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Minimal Navbar Selector Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 h-[36px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 transition-colors text-xs font-medium cursor-pointer shadow-2xs"
        aria-label="Switch Board"
        title="Select Active Board"
      >
        <span className="font-semibold text-slate-900 dark:text-white">
          {currentBoard?.name || "Select Board"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Simple, Minimal Options Dropdown */}
      {open && (
        <div className="absolute left-0 mt-1 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50">
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
                  <span className="truncate">{b.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-500 shrink-0 ml-2" />}
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

