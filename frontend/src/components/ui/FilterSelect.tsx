import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface FilterSelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export interface FilterSelectProps {
  label?: string;
  value: string;
  options: FilterSelectOption[];
  onChange: (val: string) => void;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const FilterSelect: React.FC<FilterSelectProps> = React.memo(
  ({
    label,
    value,
    options,
    onChange,
    className = "",
    buttonClassName = "",
    menuClassName = "",
    placeholder,
    disabled = false,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
      const handleOutsideClick = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleKeyDown);
      }
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isOpen]);

    const activeOption = options.find((opt) => opt.value === value);
    const displayLabel = activeOption?.label || (value === "all" ? "All" : value) || placeholder || "Select";

    return (
      <div className={`relative inline-block ${className}`} ref={containerRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`h-[38px] px-3 bg-slate-50/70 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 flex items-center justify-between gap-2 cursor-pointer transition-all duration-150 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed ${buttonClassName}`}
        >
          <span className="truncate max-w-[200px]">
            {label ? (
              <>
                <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">
                  {label}:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {displayLabel}
                </span>
              </>
            ) : (
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {displayLabel}
              </span>
            )}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180 text-sky-500" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div
            className={`absolute left-0 mt-1.5 min-w-[180px] max-w-[280px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-50 animate-fadeIn max-h-64 overflow-y-auto scrollbar-thin ${menuClassName}`}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs transition-colors duration-150 flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

FilterSelect.displayName = "FilterSelect";
