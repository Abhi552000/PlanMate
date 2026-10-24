import React from "react";

export interface PlanMateLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

const SIZE_MAP: Record<string, number> = {
  xs: 24,
  sm: 36,
  md: 44,
  lg: 64,
  xl: 80,
};

export const PlanMateLogo: React.FC<PlanMateLogoProps> = ({
  size = "md",
  className = "",
  showText = false,
  textClassName = "",
}) => {
  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 44;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform duration-200"
      >
        <defs>
          <linearGradient id="pmBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="45%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          <filter id="pmMarkShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#020617" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Squircle Container */}
        <rect x="4" y="4" width="92" height="92" rx="24" fill="url(#pmBrandGrad)" />
        {/* Subtle Inset Highlight */}
        <rect
          x="4.75"
          y="4.75"
          width="90.5"
          height="90.5"
          rx="23.25"
          stroke="white"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />

        <g filter="url(#pmMarkShadow)">
          {/* Left Pillar (Plan Foundation) */}
          <rect x="23" y="24" width="12" height="52" rx="6" fill="#FFFFFF" />

          {/* P Loop returning to stem */}
          <path
            d="M 35 30 H 53 C 61.8 30 69 37.2 69 46 C 69 54.8 61.8 62 53 62 H 35"
            stroke="#FFFFFF"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right Pillar (Mate Column) */}
          <rect x="63" y="46" width="12" height="30" rx="6" fill="#FFFFFF" />
        </g>
      </svg>

      {showText && (
        <span
          className={`text-2xl font-black bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 bg-clip-text text-transparent tracking-wide ${textClassName}`}
        >
          PlanMate
        </span>
      )}
    </div>
  );
};

export default PlanMateLogo;
