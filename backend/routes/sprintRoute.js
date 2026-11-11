import express from "express";
import authMiddleware from "../middleware/auth.js";
import { requireActiveSubscription } from "../middleware/subscriptionCheck.js";
import { checkPermission } from "../middleware/rbac.js";
import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
} from "../controllers/sprintController.js";

const sprintRouter = express.Router();

sprintRouter.use(authMiddleware, requireActiveSubscription);

sprintRouter
  .route("/")
  .get(checkPermission("sprints", "view"), getSprints)
  .post(checkPermission("sprints", "create"), createSprint);

sprintRouter
  .route("/:id")
  .put(checkPermission("sprints", "manage"), updateSprint)
  .delete(checkPermission("sprints", "delete"), deleteSprint);

export default sprintRouter;
