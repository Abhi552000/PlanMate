import express from "express";
import authMiddleware from "../middleware/auth.js";
import { requireActiveSubscription } from "../middleware/subscriptionCheck.js";
import {
  getEpics,
  createEpic,
  updateEpic,
  deleteEpic,
} from "../controllers/epicController.js";

const epicRouter = express.Router();

epicRouter.use(authMiddleware, requireActiveSubscription);

epicRouter
  .route("/")
  .get(getEpics)
  .post(createEpic);

epicRouter
  .route("/:id")
  .put(updateEpic)
  .delete(deleteEpic);

export default epicRouter;
