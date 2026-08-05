import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

interface FilterSelectProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const activeOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-3 py-2 bg-gray-50/50 dark:bg-gray-955 border border-sky-105 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 flex items-center gap-1.5 cursor-pointer transition-all duration-200"
      >
        <span>{label}: {activeOption?.label || value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-48 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl shadow-lg py-1.5 z-30 animate-fadeIn overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs transition-colors duration-150 flex items-center justify-between cursor-pointer ${
                opt.value === value
                  ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 font-bold"
                  : "text-gray-700 dark:text-gray-350 hover:bg-sky-50/50 dark:hover:bg-gray-800"
              }`}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check className="w-3.5 h-3.5 text-sky-505" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
