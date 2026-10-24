/**
 * Utility functions for user mentions in PlanMate.
 * Storage format: @[User Name](user:userId)
 * Display/Editing format: @User Name
 */

/**
 * Converts stored mentions formatted as @[Name](user:userId) to readable @Name.
 */
export const cleanMentionsForEditing = (text: string): string => {
  if (!text) return "";
  return text.replace(/@\[([^\]]+)\]\(user:[^)]+\)/g, "@$1");
};

/**
 * Converts typed @Name back to the storage format @[Name](user:userId) by lookup in the members list.
 * Longer names are matched first to prevent substring matching issues.
 */
export const formatMentionsForSaving = (text: string, members: any[]): string => {
  if (!text) return "";
  if (!members || members.length === 0) return text;

  // Sort members by name length descending to avoid matching partial names (e.g. matching "Abhishek" inside "Abhishek Singh")
  const sortedMembers = [...members].sort((a, b) => b.name.length - a.name.length);

  let formattedText = text;

  // We only replace @Name if it is not already in the storage format (e.g. @[Name](user:userId))
  // To do this safely, we match '@' followed by the name, ensuring it is a full name match.
  for (const member of sortedMembers) {
    const name = member.name;
    const escapedName = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    
    // Pattern matches @Name only if it isn't followed by '[' or '(' indicating it's already formatted,
    // and is preceded by start of text, space, or standard word boundaries.
    const regex = new RegExp(`@${escapedName}\\b`, "g");
    
    // We check if the match is inside an already formatted tag to prevent double formatting.
    // However, a simple check: if the text already contains @[Name](user:id) for this member,
    // we can temporarily replace it, run our matches, and restore it, OR we can use a more precise regex.
    // Actually, a regex that checks negative lookahead for `](user:` or similar is very clean.
    // A clean check is: replace @Name only when not followed by `](user:` and not preceded by `@[`
    // Let's implement that:
    // But since JavaScript RegExp doesn't always support complex lookbehinds easily in all browsers,
    // we can do a replace function that checks if the match is part of an existing markdown structure.
    
    formattedText = formattedText.replace(regex, (match, offset) => {
      // Check if this match is inside a @[Name](user:userId) format
      // Let's inspect the surrounding text
      const beforeStr = formattedText.substring(Math.max(0, offset - 2), offset);
      const afterStr = formattedText.substring(offset + match.length);
      
      const isAlreadyFormatted = beforeStr === "@[" && afterStr.startsWith("](user:");
      if (isAlreadyFormatted) {
        return match; // Do not modify
      }
      return `@[${name}](user:${member._id || member.id})`;
    });
  }

  return formattedText;
};
