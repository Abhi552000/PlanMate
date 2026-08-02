import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", authMiddleware, getNotifications);
notificationRouter.put("/read-all", authMiddleware, markAllAsRead);
notificationRouter.put("/:id/read", authMiddleware, markAsRead);

export default notificationRouter;
