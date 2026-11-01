import React from "react";
import { ChevronDown } from "lucide-react";
import { SelectProps } from "../../types";

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      icon,
      wrapperClassName = "",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || React.useId();
    return (
      <div className={`space-y-1.5 w-full ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
          >
            {label}
          </label>
        )}
        <div
          className={`relative flex items-center border border-slate-200/90 dark:border-slate-800 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900 transition-all duration-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 ${
            error
              ? "border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20"
              : "focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500"
          } ${props.disabled ? "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-950" : ""}`}
        >
          {icon && (
            <span className="text-sky-500 mr-2 flex items-center justify-center shrink-0">
              {icon}
            </span>
          )}
          <select
            id={selectId}
            ref={ref}
            className={`w-full focus:outline-none text-sm text-slate-800 dark:text-slate-200 bg-transparent font-medium cursor-pointer pr-6 appearance-none ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 shrink-0" />
        </div>
        {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
