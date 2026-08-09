import React from "react";

interface MentionTextProps {
  text: string;
  className?: string;
}

export const MentionText: React.FC<MentionTextProps> = ({ text = "", className = "" }) => {
  if (!text) return null;

  // Match pattern @[Name](user:userId)
  const regex = /(@\[[^\]]+\]\(user:[a-f\d]{24}\))/g;
  const parts = text.split(regex);

  return (
    <span className={`${className} whitespace-pre-wrap`}>
      {parts.map((part, index) => {
        const match = part.match(/@\[([^\]]+)\]\(user:([a-f\d]{24})\)/);
        if (match) {
          const name = match[1];
          const userId = match[2];
          return (
            <span
              key={index}
              className="inline-flex items-center bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 font-bold px-1.5 py-0.5 rounded-md border border-sky-100 dark:border-sky-900/60 mx-0.5 text-[11px] align-baseline shadow-xs"
              title={`User: ${name} (ID: ${userId})`}
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
