import express from "express";
import authMiddleware from "../middleware/auth.js";
import { requireActiveSubscription } from "../middleware/subscriptionCheck.js";
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
  .get(getSprints)
  .post(createSprint);

sprintRouter
  .route("/:id")
  .put(updateSprint)
  .delete(deleteSprint);

export default sprintRouter;
