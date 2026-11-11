import express from "express";
import authMiddleware from "../middleware/auth.js";
import { checkPermission } from "../middleware/rbac.js";
import {
  getBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
} from "../controllers/boardController.js";

const boardRouter = express.Router();

boardRouter.get("/", authMiddleware, checkPermission("boards", "view"), getBoards);
boardRouter.get("/:id", authMiddleware, checkPermission("boards", "view"), getBoardById);
boardRouter.post("/", authMiddleware, checkPermission("boards", "create"), createBoard);
boardRouter.put("/:id", authMiddleware, checkPermission("boards", "edit"), updateBoard);
boardRouter.delete("/:id", authMiddleware, checkPermission("boards", "delete"), deleteBoard);

export default boardRouter;
