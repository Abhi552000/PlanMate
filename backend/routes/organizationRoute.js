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
  getPublicOrganizations,
  getOrganizationUsers,
  updateUserStatus,
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

// Scoped organization details (Requires login)
orgRouter.get("/", authMiddleware, getOrganizationInfo);
orgRouter.put("/", authMiddleware, updateOrganizationInfo);

// Scoped members management & approvals
orgRouter.get("/users", authMiddleware, getOrganizationUsers);
orgRouter.put("/users/:userId/status", authMiddleware, updateUserStatus);
orgRouter.post("/members", authMiddleware, addOrganizationMember);
orgRouter.get("/members", authMiddleware, getOrganizationMembers);

export default orgRouter;
