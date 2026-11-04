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
  deleteWorkLog,
  getUserWorklogSummaries,
  getUserDetailedWorklogs,
  exportWorklogs,
  linkTask,
  unlinkTask,
} from "../controllers/taskContoller.js";

const taskRouter = express.Router();

taskRouter.use(authMiddleware, requireActiveSubscription);

taskRouter.route("/gp/analytics").get(getTaskAnalytics);
taskRouter.route("/gp/worklogs/users").get(getUserWorklogSummaries);
taskRouter.route("/gp/worklogs/users/:userId").get(getUserDetailedWorklogs);
taskRouter.route("/gp/worklogs/export").get(exportWorklogs);

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
taskRouter.route("/:id/worklogs/:workLogId").delete(deleteWorkLog);
taskRouter.route("/:id/links").post(linkTask);
taskRouter.route("/:id/links/:linkId").delete(unlinkTask);

export default taskRouter;
