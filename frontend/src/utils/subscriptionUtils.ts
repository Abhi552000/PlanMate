import { IUser } from "../types";

/**
 * Checks if the user's organization subscription is currently expired or past due.
 * System administrators are never subject to organization subscription expiration.
 */
export const isOrgSubscriptionExpired = (user?: IUser | null): boolean => {
  if (!user || user.role === "system_admin") {
    return false;
  }

  if (user.isSubscriptionExpired === true) {
    return true;
  }

  const org = user.organization;
  if (!org || typeof org !== "object") {
    return false;
  }

  const sub = org.subscription;
  if (!sub) {
    return false;
  }

  if (sub.status === "expired" || sub.status === "past_due") {
    return true;
  }

  if (sub.validUntil && !isNaN(new Date(sub.validUntil).getTime())) {
    return new Date(sub.validUntil).getTime() < Date.now();
  }

  return false;
};
