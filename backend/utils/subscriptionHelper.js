/**
 * subscriptionHelper.js
 * 
 * Helper functions to manage organization subscriptions, mid-cycle tier upgrades
 * (e.g., 5 seats -> 25 seats mid-month -> 250 seats), proration credits,
 * and seat quota calculations.
 */

/**
 * Calculates mid-billing-cycle upgrade proration.
 * 
 * Scenario:
 * - Org starts with 5 seats (e.g. Free or ₹499/mo).
 * - Mid-cycle (e.g. day 15 of 30), they upgrade to 25 seats (₹1,999/mo).
 *   -> 15 days remaining: Unused credit = (₹499 / 30) * 15 = ₹249.50 credit.
 *   -> Upgraded price = ₹1,999 - ₹249.50 = ₹1,749.50.
 * - Later they upgrade to 250 seats (₹9,999/mo).
 *   -> Any remaining days of the active 25-seat plan are similarly credited.
 * 
 * @param {Object} currentSubscription - The organization's current active subscription
 * @param {Object} targetPlan - The new plan document being upgraded to
 * @param {"monthly" | "yearly"} billingCycle - Selected billing cycle
 * @returns {Object} Proration details, payable amount, and cycle validity
 */
export const calculateProrationUpgrade = (
  currentSubscription = null,
  targetPlan,
  billingCycle = "monthly"
) => {
  const cycle = billingCycle || "monthly";
  const targetBasePrice =
    cycle === "yearly" && targetPlan.price > 0
      ? targetPlan.price * 10
      : targetPlan.price || 0;

  const now = new Date();
  let unusedCredit = 0;
  let remainingDays = 0;
  let totalCycleDays = cycle === "yearly" ? 365 : 30;

  // Check if organization has an existing active paid subscription with a validity window
  if (
    currentSubscription &&
    currentSubscription.amountPaid > 0 &&
    currentSubscription.validUntil
  ) {
    const validUntilDate = new Date(currentSubscription.validUntil);
    const subscribedAtDate = currentSubscription.subscribedAt
      ? new Date(currentSubscription.subscribedAt)
      : null;

    if (subscribedAtDate && !isNaN(subscribedAtDate.getTime())) {
      const cycleDiffMs = validUntilDate.getTime() - subscribedAtDate.getTime();
      const detectedDays = Math.round(cycleDiffMs / (1000 * 60 * 60 * 24));
      if (detectedDays > 0) {
        totalCycleDays = detectedDays;
      }
    }

    const remainingMs = validUntilDate.getTime() - now.getTime();
    if (remainingMs > 0) {
      remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      const dailyRate = currentSubscription.amountPaid / totalCycleDays;
      unusedCredit = Math.round(dailyRate * remainingDays);

      // Guardrail: Credit cannot exceed original amount paid
      unusedCredit = Math.min(unusedCredit, currentSubscription.amountPaid);
    }
  }

  // Calculate final payable amount after applying unused credit
  const payableAmount = Math.max(0, targetBasePrice - unusedCredit);

  // Set new validity window: 30 days for monthly, 1 year for yearly from upgrade date
  const newValidUntil = new Date(now);
  if (cycle === "yearly") {
    newValidUntil.setFullYear(newValidUntil.getFullYear() + 1);
  } else {
    newValidUntil.setDate(newValidUntil.getDate() + 30);
  }

  const isUpgrade = (targetPlan.maxMembers || 0) > (currentSubscription?.maxMembers || 0);

  let explanation = "";
  if (unusedCredit > 0) {
    explanation = `Applied ₹${unusedCredit.toLocaleString()} credit for ${remainingDays} unused day${
      remainingDays > 1 ? "s" : ""
    } on the ${currentSubscription?.planName || "previous"} plan.`;
  } else {
    explanation = `Standard ${cycle} billing cycle started.`;
  }

  return {
    targetPlanId: targetPlan.planId,
    targetPlanName: targetPlan.name,
    targetMaxMembers: targetPlan.maxMembers,
    billingCycle: cycle,
    basePrice: targetBasePrice,
    unusedCredit,
    payableAmount,
    remainingDays,
    totalCycleDays,
    isUpgrade,
    newValidUntil,
    explanation,
    previousPlanName: currentSubscription?.planName || "",
    previousMaxMembers: currentSubscription?.maxMembers || 5,
  };
};

/**
 * Accurately calculates seat usage, remaining capacity, and quota limits.
 * 
 * Guarantees:
 * activeMembers + remainingSeats === maxMembers (when activeMembers <= maxMembers)
 * 
 * @param {number} activeMembersCount - Actual number of active users in the organization
 * @param {number} totalMembersCount - Total users (active + pending/inactive)
 * @param {number} maxMembersLimit - Subscription seat quota (e.g. 5, 25, 250)
 * @returns {Object} Clean metrics breakdown
 */
export const getSeatUsageSummary = (
  activeMembersCount = 0,
  totalMembersCount = 0,
  maxMembersLimit = 5
) => {
  const maxMembers = Math.max(1, maxMembersLimit);
  const activeMembers = Math.max(0, activeMembersCount);
  const remainingSeats = Math.max(0, maxMembers - activeMembers);
  const usagePercent = Math.min(100, Math.round((activeMembers / maxMembers) * 100));
  const isQuotaExceeded = activeMembers >= maxMembers;

  return {
    activeMembersCount: activeMembers,
    activeMembers,
    totalMembersCount: Math.max(activeMembers, totalMembersCount),
    maxMembers,
    remainingSeats,
    usagePercent,
    isQuotaExceeded,
  };
};

/**
 * Checks whether an organization subscription is expired or past due.
 * 
 * @param {Object} subscription - organization.subscription object
 * @returns {boolean} True if expired
 */
export const isSubscriptionExpired = (subscription) => {
  if (!subscription) return false;
  if (subscription.status === "expired" || subscription.status === "past_due") {
    return true;
  }
  if (
    subscription.validUntil &&
    new Date(subscription.validUntil).getTime() < Date.now()
  ) {
    return true;
  }
  return false;
};
