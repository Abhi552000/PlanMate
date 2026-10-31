export const DEFAULT_STATUSES: string[] = ["To Do", "In Progress", "Done", "Reopen"];

const STORAGE_KEY = "planmate_org_statuses";

/**
 * Returns the cached statuses from localStorage or the standard default 4 statuses.
 */
export const getCachedStatuses = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Fallback to default
  }
  return DEFAULT_STATUSES;
};

/**
 * Persists statuses to localStorage for instant, layout-shift-free renders.
 */
export const setCachedStatuses = (statuses: string[]): void => {
  try {
    if (Array.isArray(statuses) && statuses.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
    }
  } catch (e) {
    // Ignore storage errors
  }
};
