import express from "express";
import authMiddleware from "../middleware/auth.js";
import { requireActiveSubscription } from "../middleware/subscriptionCheck.js";
import { checkPermission } from "../middleware/rbac.js";
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

taskRouter.route("/gp/analytics").get(checkPermission("tickets", "view"), getTaskAnalytics);
taskRouter.route("/gp/worklogs/users").get(checkPermission("tickets", "view"), getUserWorklogSummaries);
taskRouter.route("/gp/worklogs/users/:userId").get(checkPermission("tickets", "view"), getUserDetailedWorklogs);
taskRouter.route("/gp/worklogs/export").get(checkPermission("tickets", "view"), exportWorklogs);

taskRouter
  .route("/gp")
  .get(checkPermission("tickets", "view"), getTasks)
  .post(checkPermission("tickets", "create"), createTask);

taskRouter
  .route("/:id/gp")
  .get(checkPermission("tickets", "view"), getTaskById)
  .put(checkPermission("tickets", "edit"), updateTask)
  .delete(checkPermission("tickets", "delete"), deleteTask);

taskRouter.route("/:id/comments").post(checkPermission("tickets", "edit"), addTaskComment);
taskRouter.route("/:id/comments/:commentId").delete(checkPermission("tickets", "edit"), deleteTaskComment);
taskRouter.route("/:id/worklogs").post(checkPermission("tickets", "edit"), logWork);
taskRouter.route("/:id/worklogs/:workLogId").delete(checkPermission("tickets", "edit"), deleteWorkLog);
taskRouter.route("/:id/links").post(checkPermission("tickets", "edit"), linkTask);
taskRouter.route("/:id/links/:linkId").delete(checkPermission("tickets", "edit"), unlinkTask);

export default taskRouter;
