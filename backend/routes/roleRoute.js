import express from "express";
import authMiddleware from "../middleware/auth.js";
import { checkPermission } from "../middleware/rbac.js";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  assignUserRole,
} from "../controllers/roleController.js";

const roleRouter = express.Router();

roleRouter.get("/", authMiddleware, checkPermission("roles", "view"), getRoles);
roleRouter.post("/", authMiddleware, checkPermission("roles", "manage"), createRole);
roleRouter.put("/assign/:userId", authMiddleware, checkPermission("team", "approve"), assignUserRole);
roleRouter.put("/:id", authMiddleware, checkPermission("roles", "manage"), updateRole);
roleRouter.delete("/:id", authMiddleware, checkPermission("roles", "manage"), deleteRole);

export default roleRouter;
