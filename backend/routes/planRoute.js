import express from "express";
import {
  getPlans,
  getAllPlansForAdmin,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/planController.js";
import authMiddleware from "../middleware/auth.js";

const planRouter = express.Router();

// Get active plans (Org Admin & Super Admin)
planRouter.get("/", authMiddleware, getPlans);

// Super Admin management
planRouter.get("/admin/all", authMiddleware, getAllPlansForAdmin);
planRouter.post("/", authMiddleware, createPlan);
planRouter.put("/:id", authMiddleware, updatePlan);
planRouter.delete("/:id", authMiddleware, deletePlan);

export default planRouter;
