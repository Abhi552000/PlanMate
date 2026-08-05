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

export default taskRouter;
