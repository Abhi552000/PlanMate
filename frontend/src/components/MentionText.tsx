import React from "react";
import { MentionTextProps } from "../types";

export const MentionText: React.FC<MentionTextProps> = ({ text = "", className = "" }) => {
  if (!text) return null;

  // Match pattern @[Name](user:userId)
  const regex = /(@\[[^\]]+\]\(user:[^)]+\))/g;
  const parts = text.split(regex);

  return (
    <span className={`${className} whitespace-pre-wrap`}>
      {parts.map((part, index) => {
        const match = part.match(/@\[([^\]]+)\]\(user:([^)]+)\)/);
        if (match) {
          const name = match[1];
          return (
            <span
              key={index}
              className="inline-flex items-center bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 font-bold px-1.5 py-0.5 rounded-md border border-sky-100 dark:border-sky-900/60 mx-0.5 text-[11px] align-baseline shadow-xs"
              title={`@${name}`}
            >
              @{name}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};
