import Organization from "../models/organizationModel.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { isSubscriptionExpired } from "../utils/subscriptionHelper.js";
import { MESSAGES } from "../constants/messages.js";

/**
 * Middleware to require an active organization subscription for operational routes
 * (Tasks, Sprints, Epics).
 *
 * Rules:
 * 1. System administrators bypass this check completely.
 * 2. If organization subscription is expired or past due:
 *    - Members are blocked with 403 and admin contact details to reach out for renewal.
 *    - Org Admins are blocked from modifying workspace tasks, and prompted to renew in Plans & Billing.
 */
export async function requireActiveSubscription(req, res, next) {
  if (!req.user) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ success: false, message: "Not Authorized, token missing" });
  }

  // System administrators bypass organization subscription checks
  if (req.user.role === "system_admin") {
    return next();
  }

  if (!req.user.organization) {
    return next();
  }

  try {
    const org = await Organization.findById(req.user.organization).populate(
      "admin",
      "name email"
    );

    if (!org) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    if (org.isActive === false) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: MESSAGES.AUTH.ORG_INACTIVE(org.remark),
      });
    }

    if (isSubscriptionExpired(org.subscription)) {
      const adminName = org.admin?.name || "Workspace Administrator";
      const adminEmail = org.admin?.email || "";

      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        code: "SUBSCRIPTION_EXPIRED",
        role: req.user.role,
        message:
          req.user.role === "member"
            ? MESSAGES.AUTH.SUBSCRIPTION_EXPIRED(adminName, adminEmail)
            : "Your organization subscription has expired. Please renew your plan in Plans & Billing to continue accessing workspace features.",
        admin: {
          name: adminName,
          email: adminEmail,
        },
      });
    }

    req.organization = org;
    next();
  } catch (error) {
    console.error("Subscription validation middleware error:", error);
    next(error);
  }
}
