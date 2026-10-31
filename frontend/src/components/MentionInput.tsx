import React, { useState, useEffect, useRef } from "react";

interface MentionInputProps {
  value: string;
  onChange: (e: any) => void;
  name: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  members: any[];
  rows?: number;
  type?: "text" | "textarea";
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  name,
  placeholder = "",
  required = false,
  className = "",
  members = [],
  rows = 4,
  type = "text",
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [triggerIdx, setTriggerIdx] = useState(-1);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Filter members based on searchQuery
  const filteredMembers = (members || []).filter((member) => {
    if (!member) return false;
    const name = (member.name || "").toLowerCase();
    const email = (member.email || "").toLowerCase();
    const query = (searchQuery || "").toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    const selectionStart = e.target.selectionStart || 0;
    
    // Call parent onChange
    onChange(e);

    // Analyze text before selectionStart to see if we are in a mention trigger
    const textBeforeCursor = newVal.substring(0, selectionStart);
    const lastAtIdx = textBeforeCursor.lastIndexOf("@");

    if (lastAtIdx !== -1) {
      // Check if '@' is at start of line/text or preceded by space
      const charBeforeAt = lastAtIdx > 0 ? textBeforeCursor[lastAtIdx - 1] : " ";
      if (charBeforeAt === " " || charBeforeAt === "\n") {
        const textAfterAt = textBeforeCursor.substring(lastAtIdx + 1);
        // Ensure no newlines or multiple spaces inside search term (limits mention scope)
        if (!textAfterAt.includes("\n") && textAfterAt.length < 25) {
          setShowDropdown(true);
          setSearchQuery(textAfterAt);
          setTriggerIdx(lastAtIdx);
          setActiveIndex(0);
          return;
        }
      }
    }

    setShowDropdown(false);
  };

  const selectMember = (member: any) => {
    if (triggerIdx === -1 || !inputRef.current) return;

    const val = value;
    const cursor = inputRef.current.selectionStart || 0;
    const beforeTrigger = val.substring(0, triggerIdx);
    const afterCursor = val.substring(cursor);
    const mentionTag = `@${member.name} `;
    const newVal = beforeTrigger + mentionTag + afterCursor;

    // Simulate change event
    const event = {
      target: {
        name,
        value: newVal,
      },
    };
    onChange(event);

    setShowDropdown(false);

    // Reset focus and cursor position after state updates
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = triggerIdx + mentionTag.length;
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!showDropdown || filteredMembers.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filteredMembers.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      selectMember(filteredMembers[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full flex flex-col min-h-0">
      {type === "textarea" ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          name={name}
          value={value}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`w-full focus:outline-none ${className}`}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          name={name}
          value={value}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className={`w-full focus:outline-none ${className}`}
        />
      )}

      {/* Autocomplete Dropdown */}
      {showDropdown && filteredMembers.length > 0 && (
        <div className="absolute left-0 bottom-full mb-1.5 md:bottom-auto md:top-full md:mt-1.5 z-50 w-64 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl shadow-xl py-1 max-h-48 overflow-y-auto animate-fadeIn scrollbar-thin">
          <div className="px-2.5 py-1 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-sky-50 dark:border-gray-850">
            Mention Member
          </div>
          {filteredMembers.map((member, index) => (
            <button
              key={member._id || member.id}
              type="button"
              onClick={() => selectMember(member)}
              className={`w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                index === activeIndex
                  ? "bg-sky-50 dark:bg-gray-800 text-sky-700 dark:text-sky-400 font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-sky-50/50 dark:hover:bg-gray-800/50"
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-[9px] uppercase shrink-0">
                {(member.name || "U")[0]?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{member.name || "Member"}</p>
                {member.email && <p className="truncate text-[9px] text-gray-400 dark:text-gray-500">{member.email}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
