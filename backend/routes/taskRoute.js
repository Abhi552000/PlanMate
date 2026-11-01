import express from "express";
import authMiddleware from "../middleware/auth.js";
import { requireActiveSubscription } from "../middleware/subscriptionCheck.js";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  addTaskComment,
  deleteTaskComment,
  getTaskAnalytics,
  logWork,
  linkTask,
  unlinkTask,
} from "../controllers/taskContoller.js";

const taskRouter = express.Router();

taskRouter.use(authMiddleware, requireActiveSubscription);

taskRouter.route("/gp/analytics").get(getTaskAnalytics);

taskRouter
  .route("/gp")
  .get(getTasks)
  .post(createTask);

taskRouter
  .route("/:id/gp")
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

taskRouter.route("/:id/comments").post(addTaskComment);
taskRouter.route("/:id/comments/:commentId").delete(deleteTaskComment);
taskRouter.route("/:id/worklogs").post(logWork);
taskRouter.route("/:id/links").post(linkTask);
taskRouter.route("/:id/links/:linkId").delete(unlinkTask);

export default taskRouter;
