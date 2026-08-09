import express from "express";
import authMiddleware from "../middleware/auth.js";
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

taskRouter.route("/gp/analytics").get(authMiddleware, getTaskAnalytics);

taskRouter
  .route("/gp")
  .get(authMiddleware, getTasks)
  .post(authMiddleware, createTask);

taskRouter
  .route("/:id/gp")
  .get(authMiddleware, getTaskById)
  .put(authMiddleware, updateTask)
  .delete(authMiddleware, deleteTask);

taskRouter.route("/:id/comments").post(authMiddleware, addTaskComment);
taskRouter.route("/:id/comments/:commentId").delete(authMiddleware, deleteTaskComment);
taskRouter.route("/:id/worklogs").post(authMiddleware, logWork);
taskRouter.route("/:id/links").post(authMiddleware, linkTask);
taskRouter.route("/:id/links/:linkId").delete(authMiddleware, unlinkTask);

export default taskRouter;
