import React from "react";
import { InputProps } from "../../types";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, icon, wrapperClassName = "", className = "", id, ...props },
    ref
  ) => {
    const inputId = id || React.useId();
    return (
      <div className={`space-y-1.5 w-full ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
          >
            {label}
          </label>
        )}
        <div
          className={`flex items-center border border-slate-200/90 dark:border-slate-800 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900 transition-all duration-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 ${
            props.disabled
              ? "opacity-60 bg-slate-50 dark:bg-slate-950 cursor-not-allowed select-none"
              : "focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500"
          } ${error ? "border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20" : ""}`}
        >
          {icon && (
            <span className="text-sky-500 mr-2 flex items-center justify-center shrink-0">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full focus:outline-none text-sm text-slate-800 dark:text-slate-200 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 font-medium ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
