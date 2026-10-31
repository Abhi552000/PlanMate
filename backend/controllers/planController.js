import Plan from "../models/planModel.js";
import { HttpStatus } from "../constants/httpStatus.js";

const DEFAULT_PLANS = [
  {
    planId: "free",
    name: "Starter",
    price: 0,
    currency: "INR",
    billingCycle: "monthly",
    maxMembers: 5,
    description: "Ideal for small teams and agile experiments.",
    features: [
      "Up to 5 team members",
      "Kanban & Backlog board",
      "Standard CSV export",
      "Community support",
      "Single active sprint",
    ],
    isPopular: false,
    isActive: true,
  },
  {
    planId: "pro",
    name: "Pro Growth",
    price: 1499,
    currency: "INR",
    billingCycle: "monthly",
    maxMembers: 25,
    description: "For scaling teams that need higher capacity and custom workflows.",
    features: [
      "Up to 25 team members",
      "Unlimited active sprints",
      "Custom workflow statuses",
      "Advanced analytics & velocity reports",
      "Priority email support",
    ],
    isPopular: true,
    isActive: true,
  },
  {
    planId: "enterprise",
    name: "Enterprise Scale",
    price: 5999,
    currency: "INR",
    billingCycle: "monthly",
    maxMembers: 250,
    description: "Unlimited power, dedicated support, and enterprise governance.",
    features: [
      "Up to 250 team members",
      "Unlimited tasks & sprints",
      "Audit logs & compliance",
      "Custom branding & domains",
      "24/7 dedicated support manager",
    ],
    isPopular: false,
    isActive: true,
  },
];

// Seed default plans if collection is empty
const ensureDefaultPlans = async () => {
  const count = await Plan.countDocuments();
  if (count === 0) {
    await Plan.insertMany(DEFAULT_PLANS);
  }
};

// GET /api/plans - Fetch all active plans (for Org Admin & Super Admin)
export const getPlans = async (req, res) => {
  try {
    await ensureDefaultPlans();
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
    res.json({ success: true, plans });
  } catch (error) {
    console.error("Get plans error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Failed to retrieve plans" });
  }
};

// GET /api/plans/admin/all - System Admin: Get all plans (including inactive)
export const getAllPlansForAdmin = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: "System Admin privileges required" });
  }

  try {
    await ensureDefaultPlans();
    const plans = await Plan.find({}).sort({ price: 1 });
    res.json({ success: true, plans });
  } catch (error) {
    console.error("Get admin plans error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Failed to retrieve plans" });
  }
};

// POST /api/plans - System Admin: Create a new plan
export const createPlan = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: "System Admin privileges required" });
  }

  const {
    planId,
    name,
    price,
    currency,
    billingCycle,
    maxMembers,
    description,
    features,
    isPopular,
  } = req.body;

  if (!planId || !name || price === undefined || !maxMembers) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: "Plan ID, Name, Price, and Max Members are required" });
  }

  try {
    const existing = await Plan.findOne({ planId: planId.toLowerCase() });
    if (existing) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: "A plan with this ID already exists" });
    }

    const newPlan = await Plan.create({
      planId: planId.toLowerCase().trim(),
      name: name.trim(),
      price: Number(price),
      currency: currency || "INR",
      billingCycle: billingCycle || "monthly",
      maxMembers: Number(maxMembers),
      description: description || "",
      features: Array.isArray(features) ? features : [],
      isPopular: Boolean(isPopular),
      isActive: true,
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Plan created successfully",
      plan: newPlan,
    });
  } catch (error) {
    console.error("Create plan error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Failed to create plan" });
  }
};

// PUT /api/plans/:id - System Admin: Update plan details
export const updatePlan = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: "System Admin privileges required" });
  }

  const { id } = req.params;
  const {
    name,
    price,
    currency,
    billingCycle,
    maxMembers,
    description,
    features,
    isPopular,
    isActive,
  } = req.body;

  try {
    const plan = await Plan.findById(id);
    if (!plan) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: "Plan not found" });
    }

    if (name) plan.name = name.trim();
    if (price !== undefined) plan.price = Number(price);
    if (currency) plan.currency = currency;
    if (billingCycle) plan.billingCycle = billingCycle;
    if (maxMembers !== undefined) plan.maxMembers = Number(maxMembers);
    if (description !== undefined) plan.description = description;
    if (features !== undefined) plan.features = Array.isArray(features) ? features : plan.features;
    if (isPopular !== undefined) plan.isPopular = Boolean(isPopular);
    if (isActive !== undefined) plan.isActive = Boolean(isActive);

    await plan.save();

    res.json({
      success: true,
      message: "Plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Update plan error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Failed to update plan" });
  }
};

// DELETE /api/plans/:id - System Admin: Delete or disable plan
export const deletePlan = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: "System Admin privileges required" });
  }

  const { id } = req.params;

  try {
    const plan = await Plan.findById(id);
    if (!plan) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: "Plan not found" });
    }

    if (plan.planId === "free") {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: "The default Free tier cannot be deleted" });
    }

    await Plan.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete plan error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Failed to delete plan" });
  }
};
