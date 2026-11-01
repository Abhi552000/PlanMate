import React from "react";
import { Search, X } from "lucide-react";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
}

export const SearchInput: React.FC<SearchInputProps> = React.memo(
  ({
    value,
    onChange,
    placeholder = "Search...",
    onClear,
    className = "",
    disabled = false,
    autoFocus = false,
    id,
  }) => {
    const inputId = id || React.useId();

    const handleClear = () => {
      onChange("");
      onClear?.();
    };

    return (
      <div className={`relative flex items-center min-w-[200px] ${className}`}>
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
        <input
          id={inputId}
          type="text"
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-[38px] pl-9 pr-8 bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl text-xs font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
