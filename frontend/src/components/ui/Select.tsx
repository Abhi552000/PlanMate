import React from "react";

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  icon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, icon, wrapperClassName = "", className = "", id, ...props }, ref) => {
    const selectId = id || React.useId();
    return (
      <div className={`space-y-1.5 w-full ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1"
          >
            {label}
          </label>
        )}
        <div
          className={`flex items-center border border-sky-100 dark:border-gray-700 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 bg-white dark:bg-gray-800/50 transition-all duration-200 ${
            error ? "border-red-500 focus-within:ring-red-500" : ""
          }`}
        >
          {icon && <span className="text-sky-500 mr-2 flex items-center justify-center shrink-0">{icon}</span>}
          <select
            id={selectId}
            ref={ref}
            className={`w-full focus:outline-none text-sm text-gray-700 dark:text-gray-250 bg-transparent font-medium cursor-pointer ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-850 text-gray-850 dark:text-gray-200">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="text-xs text-red-500 font-semibold">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
