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
            className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1"
          >
            {label}
          </label>
        )}
        <div
          className={`flex items-center border border-sky-100 dark:border-gray-700 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800/50 transition-all duration-200 ${
            props.disabled
              ? "opacity-60 bg-gray-50 dark:bg-gray-850/50 cursor-not-allowed select-none"
              : "focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500"
          } ${error ? "border-red-500 focus-within:ring-red-500" : ""}`}
        >
          {icon && (
            <span className="text-sky-500 mr-2 flex items-center justify-center shrink-0">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full focus:outline-none text-sm text-gray-700 dark:text-gray-200 bg-transparent placeholder-gray-400 dark:placeholder-gray-500 font-medium ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
