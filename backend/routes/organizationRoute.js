import express from "express";
import {
  onboardOrganization,
  getOrganizationInfo,
  updateOrganizationInfo,
  addOrganizationMember,
  getOrganizationMembers,
  getAllOrganizations,
  deleteOrganization,
  updateOrganizationAdmin,
  updateOrganizationStatus,
  resetAdminPassword,
  getPublicOrganizations,
  getOrganizationUsers,
  updateUserStatus,
  addCustomStatus,
  deleteCustomStatus,
  getOrganizationSubscription,
  subscribeToPlan,
  previewPlanUpgrade,
  updateTenantPlanBySysAdmin,
  getOrganizationBillingHistory,
  getAllPaymentsForSysAdmin,
} from "../controllers/organizationController.js";
import authMiddleware from "../middleware/auth.js";

const orgRouter = express.Router();

// Public route (used in registration dropdown)
orgRouter.get("/public-list", getPublicOrganizations);

// System Admin onboard & management
orgRouter.post("/onboard", authMiddleware, onboardOrganization);
orgRouter.get("/all", authMiddleware, getAllOrganizations);
orgRouter.delete("/:id", authMiddleware, deleteOrganization);
orgRouter.put("/:id/admin", authMiddleware, updateOrganizationAdmin);
orgRouter.put("/:id/status", authMiddleware, updateOrganizationStatus);
orgRouter.put("/:id/subscription", authMiddleware, updateTenantPlanBySysAdmin);
orgRouter.post("/:id/reset-admin-password", authMiddleware, resetAdminPassword);
orgRouter.get("/admin/payments", authMiddleware, getAllPaymentsForSysAdmin);

// Scoped organization details (Requires login)
orgRouter.get("/", authMiddleware, getOrganizationInfo);
orgRouter.put("/", authMiddleware, updateOrganizationInfo);

// Scoped subscription & plan billing (Org Admin only)
orgRouter.get("/subscription", authMiddleware, getOrganizationSubscription);
orgRouter.get("/subscription-preview", authMiddleware, previewPlanUpgrade);
orgRouter.post("/subscribe", authMiddleware, subscribeToPlan);
orgRouter.get("/billing-history", authMiddleware, getOrganizationBillingHistory);

// Scoped members management & approvals
orgRouter.get("/users", authMiddleware, getOrganizationUsers);
orgRouter.put("/users/:userId/status", authMiddleware, updateUserStatus);
orgRouter.post("/members", authMiddleware, addOrganizationMember);
orgRouter.get("/members", authMiddleware, getOrganizationMembers);

// Scoped custom statuses
orgRouter.post("/statuses", authMiddleware, addCustomStatus);
orgRouter.delete("/statuses/:statusName", authMiddleware, deleteCustomStatus);

export default orgRouter;
