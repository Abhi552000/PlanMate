import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  getSprints,
  createSprint,
  updateSprint,
  deleteSprint,
} from "../controllers/sprintController.js";

const sprintRouter = express.Router();

sprintRouter
  .route("/")
  .get(authMiddleware, getSprints)
  .post(authMiddleware, createSprint);

sprintRouter
  .route("/:id")
  .put(authMiddleware, updateSprint)
  .delete(authMiddleware, deleteSprint);

export default sprintRouter;
