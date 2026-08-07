import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  getEpics,
  createEpic,
  updateEpic,
  deleteEpic,
} from "../controllers/epicController.js";

const epicRouter = express.Router();

epicRouter
  .route("/")
  .get(authMiddleware, getEpics)
  .post(authMiddleware, createEpic);

epicRouter
  .route("/:id")
  .put(authMiddleware, updateEpic)
  .delete(authMiddleware, deleteEpic);

export default epicRouter;
