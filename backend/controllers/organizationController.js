import Organization from "../models/organizationModel.js";
import User from "../models/userModel.js";
import Task from "../models/taskModel.js";
import Plan from "../models/planModel.js";
import Payment from "../models/paymentModel.js";
import {
  calculateProrationUpgrade,
  getSeatUsageSummary,
} from "../utils/subscriptionHelper.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { HttpStatus } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/messages.js";

// Onboard a new organization (System Admin or Public Onboarding)
export const onboardOrganization = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.SYS_ADMIN_REQUIRED });
  }
  const { orgName, adminName, adminEmail, adminPassword } = req.body;

  if (!orgName || !adminName || !adminEmail) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: "Organization Name, Admin Name and Admin Email are required" });
  }

  if (!validator.isEmail(adminEmail)) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.AUTH.INVALID_EMAIL });
  }

  // Generate random password if not provided
  const generatedPassword = adminPassword || (Math.random().toString(36).slice(-8) + "!");

  if (generatedPassword.length < 8) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.AUTH.PASSWORD_LENGTH });
  }

  try {
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.ORG.ONBOARD_FAILED + ": Admin user already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    // Create user placeholder
    const user = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "org_admin",
    });

    const savedUser = await user.save();

    // Create Organization
    const organization = new Organization({
      name: orgName,
      admin: savedUser._id,
    });

    const savedOrg = await organization.save();

    // Link user to organization
    savedUser.organization = savedOrg._id;
    await savedUser.save();

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: MESSAGES.ORG.ONBOARD_SUCCESS,
      organization: savedOrg,
      admin: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        password: generatedPassword, // return random password for copying
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Get current organization info
export const getOrganizationInfo = async (req, res) => {
  try {
    if (!req.user.organization) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }
    const org = await Organization.findById(req.user.organization).populate("admin", "name email");
    if (!org) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }
    res.json({ success: true, organization: org });
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Update organization info (Org Admin only)
export const updateOrganizationInfo = async (req, res) => {
  const { name, description } = req.body;

  if (req.user.role !== "org_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.NOT_AUTHORIZED });
  }

  if (!name) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.ORG.NOT_FOUND + ": Name required" });
  }

  try {
    const updated = await Organization.findByIdAndUpdate(
      req.user.organization,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    res.json({ success: true, message: MESSAGES.ORG.UPDATED, organization: updated });
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Add a member to organization (Org Admin only)
export const addOrganizationMember = async (req, res) => {
  const { name, email, password } = req.body;

  if (req.user.role !== "org_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.NOT_AUTHORIZED });
  }

  if (!name || !email || !password) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.AUTH.ALL_FIELDS_REQUIRED });
  }

  if (!validator.isEmail(email)) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.AUTH.INVALID_EMAIL });
  }

  if (password.length < 8) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.AUTH.PASSWORD_LENGTH });
  }

  try {
    // Check Organization Plan Member Limit
    const org = await Organization.findById(req.user.organization);
    if (!org) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    const maxAllowed = org.subscription?.maxMembers || 5;
    const currentActive = await User.countDocuments({
      organization: req.user.organization,
      status: "active",
    });

    if (currentActive >= maxAllowed) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: `Team size limit reached (${currentActive}/${maxAllowed} members) for your ${
          org.subscription?.planName || "Starter"
        } plan. Please upgrade your subscription to add more members.`,
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.AUTH.USER_EXISTS });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const member = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "member",
      organization: req.user.organization,
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: MESSAGES.ORG.MEMBER_ADDED,
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Get all members in organization
export const getOrganizationMembers = async (req, res) => {
  try {
    if (!req.user.organization) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }
    const members = await User.find({ organization: req.user.organization, status: "active" }).select("name email role");
    res.json({ success: true, members });
  } catch (error) {
    console.error(error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Get all organizations (System admin only with resource aggregations & backend filtering)
export const getAllOrganizations = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.SYS_ADMIN_REQUIRED });
  }
  try {
    const { status, search, plan, billingCycle, page, limit } = req.query;

    const filter = {};

    // 1. Status Filter
    if (status && status !== "all") {
      if (status === "active") filter.isActive = true;
      else if (status === "inactive") filter.isActive = false;
    }

    // 2. Plan Filter
    if (plan && plan !== "all") {
      filter["subscription.planId"] = plan.toLowerCase();
    }

    // 3. Billing Cycle Filter
    if (billingCycle && billingCycle !== "all") {
      filter["subscription.billingCycle"] = billingCycle.toLowerCase();
    }

    // 4. Search Filter (matches name, slug, or admin user name/email)
    if (search && search.trim()) {
      const q = search.trim();
      const matchingAdmins = await User.find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      }).select("_id");
      const adminIds = matchingAdmins.map((u) => u._id);

      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { slug: { $regex: q, $options: "i" } },
        { admin: { $in: adminIds } },
      ];
    }

    const [totalPlatformUsers, totalPlatformTasks, totalOrganizations, activeOrganizations, totalCount] =
      await Promise.all([
        User.countDocuments({ role: { $ne: "system_admin" } }),
        Task.countDocuments({}),
        Organization.countDocuments({}),
        Organization.countDocuments({ isActive: true }),
        Organization.countDocuments(filter),
      ]);
    const inactiveOrganizations = Math.max(0, totalOrganizations - activeOrganizations);

    let query = Organization.find(filter)
      .populate("admin", "name email")
      .sort({ createdAt: -1 });

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (!isNaN(pageNum) && !isNaN(limitNum) && limitNum > 0) {
      const skip = (pageNum - 1) * limitNum;
      query = query.skip(skip).limit(limitNum);
    }

    const orgs = await query.lean();

    const orgIds = orgs.map((o) => o._id);
    const [userCounts, taskCounts] = await Promise.all([
      User.aggregate([
        { $match: { organization: { $in: orgIds } } },
        { $group: { _id: "$organization", count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { organization: { $in: orgIds } } },
        { $group: { _id: "$organization", count: { $sum: 1 } } },
      ]),
    ]);

    const userCountMap = new Map(userCounts.map((u) => [u._id.toString(), u.count]));
    const taskCountMap = new Map(taskCounts.map((t) => [t._id.toString(), t.count]));

    const enrichedOrgs = orgs.map((org) => ({
      ...org,
      memberCount: userCountMap.get(org._id.toString()) || 0,
      taskCount: taskCountMap.get(org._id.toString()) || org.taskCounter || 0,
    }));

    res.json({
      success: true,
      organizations: enrichedOrgs,
      pagination: {
        total: totalCount,
        page: pageNum || 1,
        limit: limitNum || totalCount,
        totalPages: limitNum ? Math.max(1, Math.ceil(totalCount / limitNum)) : 1,
      },
      systemMetrics: {
        totalPlatformUsers,
        totalPlatformTasks,
        totalOrganizations,
        activeOrganizations,
        inactiveOrganizations,
        dbStatus: "connected",
        nodeEnv: process.env.NODE_ENV || "development",
      },
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Reset Organization Admin Password (System Admin support tool)
export const resetAdminPassword = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.SYS_ADMIN_REQUIRED });
  }

  const { id } = req.params;

  try {
    const org = await Organization.findById(id);
    if (!org) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    const adminUser = await User.findById(org.admin);
    if (!adminUser) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.ADMIN_NOT_FOUND });
    }

    const tempPassword = "PM#" + Math.random().toString(36).slice(-6) + "!" + Math.floor(10 + Math.random() * 90);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    adminUser.password = hashedPassword;
    await adminUser.save();

    res.json({
      success: true,
      message: "Admin password successfully reset",
      admin: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        temporaryPassword: tempPassword,
      },
    });
  } catch (error) {
    console.error("Reset admin password error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Delete Organization (System Admin cascades delete tasks, users and org document)
export const deleteOrganization = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.SYS_ADMIN_REQUIRED });
  }

  const { id } = req.params;

  try {
    const org = await Organization.findById(id);
    if (!org) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    // Cascade delete tasks
    await Task.deleteMany({ organization: id });

    // Cascade delete users
    await User.deleteMany({ organization: id });

    // Delete organization itself
    await Organization.findByIdAndDelete(id);

    res.json({ success: true, message: MESSAGES.ORG.ORG_DELETED });
  } catch (error) {
    console.error("Delete org error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Update Organization Admin details (System Admin)
export const updateOrganizationAdmin = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.SYS_ADMIN_REQUIRED });
  }

  const { id } = req.params;
  const { orgName, adminName, adminEmail, adminPassword } = req.body;

  try {
    const org = await Organization.findById(id);
    if (!org) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    if (orgName) {
      org.name = orgName;
      await org.save();
    }

    const adminUser = await User.findById(org.admin);
    if (adminUser) {
      if (adminName) adminUser.name = adminName;
      if (adminEmail) {
        const emailExists = await User.findOne({ email: adminEmail, _id: { $ne: adminUser._id } });
        if (emailExists) {
          return res
            .status(HttpStatus.BAD_REQUEST)
            .json({ success: false, message: "Email is already in use by another user" });
        }
        adminUser.email = adminEmail;
      }
      if (adminPassword) {
        if (adminPassword.length < 8) {
          return res
            .status(HttpStatus.BAD_REQUEST)
            .json({ success: false, message: MESSAGES.AUTH.PASSWORD_LENGTH });
        }
        adminUser.password = await bcrypt.hash(adminPassword, 10);
      }
      await adminUser.save();
    } else {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.ADMIN_NOT_FOUND });
    }

    res.json({ success: true, message: MESSAGES.ORG.ADMIN_UPDATED });
  } catch (error) {
    console.error("Update org error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Update Organization active status and remark (System Admin)
export const updateOrganizationStatus = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.SYS_ADMIN_REQUIRED });
  }

  const { id } = req.params;
  const { isActive, remark } = req.body;

  try {
    const org = await Organization.findById(id);
    if (!org) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    if (isActive !== undefined) {
      org.isActive = isActive;
    }
    if (remark !== undefined) {
      org.remark = remark;
    }

    await org.save();

    res.json({ success: true, message: MESSAGES.ORG.MEMBER_STATUS_UPDATED, organization: org });
  } catch (error) {
    console.error("Status update error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Get public organization list for signup dropdown
export const getPublicOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find({ isActive: true }).select("name");
    res.json({ success: true, organizations: orgs });
  } catch (error) {
    console.error("Public list error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Get organization users with stats (solved tickets count)
export const getOrganizationUsers = async (req, res) => {
  try {
    if (!req.user.organization) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const filter = { organization: req.user.organization };

    // Filter by Status (active, pending, rejected)
    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    // Filter by Role (org_admin, member)
    if (req.query.role && req.query.role !== "all") {
      filter.role = req.query.role;
    }

    // Search by Name or Email
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), "i");
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const totalCount = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("name email role status statusRemark createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const userIds = users.map(u => u._id);
    const stats = await Task.aggregate([
      {
        $match: {
          assignee: { $in: userIds }
        }
      },
      {
        $group: {
          _id: { assignee: "$assignee", status: "$status" },
          count: { $sum: 1 }
        }
      }
    ]);

    const statsMap = {};
    stats.forEach(item => {
      if (!item._id.assignee) return;
      const assigneeId = item._id.assignee.toString();
      const status = item._id.status;
      if (!statsMap[assigneeId]) {
        statsMap[assigneeId] = { solved: 0, todo: 0, pending: 0 };
      }
      if (status === "Done") {
        statsMap[assigneeId].solved += item.count;
      } else {
        statsMap[assigneeId].pending += item.count;
        if (status === "To Do") {
          statsMap[assigneeId].todo += item.count;
        }
      }
    });

    const usersWithStats = users.map(u => {
      const uId = u._id.toString();
      const uStats = statsMap[uId] || { solved: 0, todo: 0, pending: 0 };
      return {
        ...u.toObject(),
        solvedTasks: uStats.solved,
        todoTasks: uStats.todo,
        pendingTasks: uStats.pending
      };
    });

    res.json({
      success: true,
      users: usersWithStats,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error("Get organization users error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Update user approval status (Org Admin only)
export const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { status, remark } = req.body;

  if (req.user.role !== "org_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.NOT_AUTHORIZED });
  }

  if (!["active", "rejected"].includes(status)) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.ORG.STATUS_REQUIRED });
  }

  try {
    const userToUpdate = await User.findOne({ _id: userId, organization: req.user.organization });
    if (!userToUpdate) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.MEMBER_NOT_FOUND });
    }

    // If activating a member, enforce plan member quota
    if (status === "active" && userToUpdate.status !== "active") {
      const org = await Organization.findById(req.user.organization);
      const maxAllowed = org?.subscription?.maxMembers || 5;
      const currentActive = await User.countDocuments({
        organization: req.user.organization,
        status: "active",
      });

      if (currentActive >= maxAllowed) {
        return res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          message: `Cannot activate user. Plan member limit of ${maxAllowed} reached for ${
            org?.subscription?.planName || "Starter"
          }. Upgrade your subscription to allow more members.`,
        });
      }
    }

    userToUpdate.status = status;
    userToUpdate.statusRemark = remark || "";
    await userToUpdate.save();

    res.json({ success: true, message: MESSAGES.ORG.MEMBER_STATUS_UPDATED });
  } catch (error) {
    console.error("Status update error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Add a custom status to organization (Org Admin only)
export const addCustomStatus = async (req, res) => {
  const { status } = req.body;

  if (req.user.role !== "org_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.NOT_AUTHORIZED });
  }

  if (!status || !status.trim()) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.ORG.STATUS_REQUIRED });
  }

  const trimmedStatus = status.trim();

  try {
    const org = await Organization.findById(req.user.organization);
    if (!org) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    // Initialize statuses if not present
    if (!org.statuses || org.statuses.length === 0) {
      org.statuses = ["To Do", "In Progress", "Done"];
    }

    // Check for duplicate status (case-insensitive)
    const exists = org.statuses.some(s => s.toLowerCase() === trimmedStatus.toLowerCase());
    if (exists) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.ORG.STATUS_EXISTS });
    }

    org.statuses.push(trimmedStatus);
    await org.save();

    res.json({ success: true, message: MESSAGES.ORG.STATUS_ADDED, statuses: org.statuses });
  } catch (error) {
    console.error("Add custom status error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// Delete a custom status from organization (Org Admin only)
export const deleteCustomStatus = async (req, res) => {
  const { statusName } = req.params;

  if (req.user.role !== "org_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.NOT_AUTHORIZED });
  }

  try {
    const org = await Organization.findById(req.user.organization);
    if (!org) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    // Initialize statuses if not present
    if (!org.statuses || org.statuses.length === 0) {
      org.statuses = ["To Do", "In Progress", "Done"];
    }

    // Enforce that we don't delete if there is only 1 status left
    if (org.statuses.length <= 1) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: "Organization must have at least one status" });
    }

    // Check if status exists in org
    const index = org.statuses.findIndex(s => s.toLowerCase() === statusName.toLowerCase());
    if (index === -1) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.STATUS_NOT_FOUND });
    }

    // CRITICAL INTEGRITY CHECK: Check if any tasks in this organization use this status
    const matchingStatusName = org.statuses[index];
    const taskCount = await Task.countDocuments({
      organization: req.user.organization,
      status: matchingStatusName
    });

    if (taskCount > 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: `Cannot delete status "${matchingStatusName}" because it is currently assigned to ${taskCount} task(s)`
      });
    }

    // Filter out the status
    org.statuses.splice(index, 1);
    await org.save();

    res.json({ success: true, message: MESSAGES.ORG.STATUS_DELETED, statuses: org.statuses });
  } catch (error) {
    console.error("Delete custom status error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// GET /api/organization/subscription - Org Admin: Get subscription details and quota metrics
export const getOrganizationSubscription = async (req, res) => {
  if (req.user?.role !== "org_admin" && req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.NOT_AUTHORIZED });
  }

  const orgId = req.user.organization;
  if (!orgId) {
    return res
      .status(HttpStatus.NOT_FOUND)
      .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
  }

  try {
    const org = await Organization.findById(orgId);
    if (!org) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    const activeMembersCount = await User.countDocuments({
      organization: orgId,
      status: "active",
    });

    const totalMembersCount = await User.countDocuments({
      organization: orgId,
    });

    const maxMembers = org.subscription?.maxMembers || 5;
    const metrics = getSeatUsageSummary(activeMembersCount, totalMembersCount, maxMembers);

    res.json({
      success: true,
      subscription: {
        planId: org.subscription?.planId || "free",
        planName: org.subscription?.planName || "Starter",
        maxMembers: metrics.maxMembers,
        status: org.subscription?.status || "active",
        billingCycle: org.subscription?.billingCycle || "monthly",
        amountPaid: org.subscription?.amountPaid || 0,
        currency: org.subscription?.currency || "INR",
        paymentMethod: org.subscription?.paymentMethod || "dummy_gateway",
        transactionId: org.subscription?.transactionId || "",
        subscribedAt: org.subscription?.subscribedAt || org.createdAt,
        validUntil: org.subscription?.validUntil || null,
      },
      metrics,
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// GET /api/organization/subscription-preview - Org Admin: Preview proration and upgrade calculation
export const previewPlanUpgrade = async (req, res) => {
  if (req.user?.role !== "org_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.NOT_AUTHORIZED });
  }

  const { planId, billingCycle } = req.query;
  if (!planId) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: "Plan ID is required" });
  }

  try {
    const org = await Organization.findById(req.user.organization);
    if (!org) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    const plan = await Plan.findOne({ planId: planId.toLowerCase() });
    if (!plan) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: "Selected plan does not exist" });
    }

    const proration = calculateProrationUpgrade(
      org.subscription,
      plan,
      billingCycle || "monthly"
    );

    res.json({
      success: true,
      preview: proration,
    });
  } catch (error) {
    console.error("Subscription preview error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// POST /api/organization/subscribe - Org Admin: Process dummy payment & upgrade subscription
export const subscribeToPlan = async (req, res) => {
  if (req.user?.role !== "org_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.NOT_AUTHORIZED });
  }

  const { planId, billingCycle, paymentDetails } = req.body;
  if (!planId) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: "Plan ID is required" });
  }

  try {
    const org = await Organization.findById(req.user.organization);
    if (!org) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    const plan = await Plan.findOne({ planId: planId.toLowerCase() });
    if (!plan) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: "Selected subscription plan does not exist" });
    }

    // Calculate mid-cycle upgrade proration credit & new cycle duration
    const proration = calculateProrationUpgrade(
      org.subscription,
      plan,
      billingCycle
    );

    const transactionId = `TXN_${Date.now().toString(36).toUpperCase()}_${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Create durable Payment record for history
    const payment = await Payment.create({
      organization: org._id,
      organizationName: org.name,
      user: req.user._id,
      userName: req.user.name || "",
      userEmail: req.user.email || "",
      planId: plan.planId,
      planName: plan.name,
      amount: proration.payableAmount,
      currency: plan.currency || "INR",
      billingCycle: proration.billingCycle,
      paymentMethod: paymentDetails?.method || "Card",
      transactionId,
      invoiceNumber,
      status: "Paid",
      maxMembers: plan.maxMembers,
      prorationCredit: proration.unusedCredit,
      previousPlanName: proration.previousPlanName,
      paidAt: new Date(),
    });

    // 2. Update current active organization subscription
    org.subscription = {
      planId: plan.planId,
      planName: plan.name,
      maxMembers: plan.maxMembers,
      status: "active",
      billingCycle: proration.billingCycle,
      amountPaid: proration.payableAmount,
      currency: plan.currency || "INR",
      paymentMethod: paymentDetails?.method || "Card",
      transactionId,
      subscribedAt: new Date(),
      validUntil: proration.newValidUntil,
    };

    await org.save();

    res.json({
      success: true,
      message: `Successfully upgraded to ${plan.name} plan!`,
      subscription: org.subscription,
      receipt: {
        transactionId,
        invoiceNumber,
        amount: proration.payableAmount,
        basePrice: proration.basePrice,
        prorationCredit: proration.unusedCredit,
        currency: plan.currency || "INR",
        paidAt: payment.paidAt,
        status: "Paid",
        plan: plan.name,
        maxMembers: plan.maxMembers,
        explanation: proration.explanation,
      },
    });
  } catch (error) {
    console.error("Subscribe to plan error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// GET /api/organization/billing-history - Org Admin: Get payment transactions with backend filters
export const getOrganizationBillingHistory = async (req, res) => {
  try {
    if (!req.user?.organization) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: "Organization is required" });
    }

    const { status, billingCycle, search } = req.query;
    const filter = { organization: req.user.organization };

    if (status && status !== "all") {
      filter.status = status.toLowerCase();
    }
    if (billingCycle && billingCycle !== "all") {
      filter.billingCycle = billingCycle.toLowerCase();
    }
    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { planName: { $regex: q, $options: "i" } },
        { invoiceNumber: { $regex: q, $options: "i" } },
        { transactionId: { $regex: q, $options: "i" } },
      ];
    }

    const payments = await Payment.find(filter)
      .sort({ paidAt: -1 })
      .lean();

    res.json({ success: true, payments, total: payments.length });
  } catch (error) {
    console.error("Billing history error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// GET /api/organization/all-payments - System Admin: Get all payment history across all organizations with backend filters
export const getAllPaymentsForSysAdmin = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.SYS_ADMIN_REQUIRED });
  }

  try {
    const { status, search, plan, billingCycle } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status.toLowerCase();
    }
    if (billingCycle && billingCycle !== "all") {
      filter.billingCycle = billingCycle.toLowerCase();
    }
    if (plan && plan !== "all") {
      filter.planId = plan.toLowerCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      const matchingOrgs = await Organization.find({
        name: { $regex: q, $options: "i" },
      }).select("_id");
      const orgIds = matchingOrgs.map((o) => o._id);

      filter.$or = [
        { organization: { $in: orgIds } },
        { planName: { $regex: q, $options: "i" } },
        { invoiceNumber: { $regex: q, $options: "i" } },
        { transactionId: { $regex: q, $options: "i" } },
        { userName: { $regex: q, $options: "i" } },
        { userEmail: { $regex: q, $options: "i" } },
      ];
    }

    const payments = await Payment.find(filter)
      .populate("organization", "name slug")
      .sort({ paidAt: -1 })
      .lean();

    res.json({ success: true, payments, total: payments.length });
  } catch (error) {
    console.error("All payments error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// PUT /api/organization/:id/subscription - System Admin: Override an organization's plan
export const updateTenantPlanBySysAdmin = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.SYS_ADMIN_REQUIRED });
  }

  const { id } = req.params;
  const { planId, maxMembers } = req.body;

  try {
    const org = await Organization.findById(id);
    if (!org) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    let plan = null;
    if (planId) {
      plan = await Plan.findOne({ planId: planId.toLowerCase() });
    }

    org.subscription = {
      planId: plan?.planId || planId || org.subscription?.planId || "free",
      planName: plan?.name || org.subscription?.planName || "Starter",
      maxMembers:
        maxMembers !== undefined
          ? Number(maxMembers)
          : plan?.maxMembers || org.subscription?.maxMembers || 5,
      status: "active",
      billingCycle: "monthly",
      amountPaid: plan?.price || 0,
      currency: plan?.currency || "INR",
      paymentMethod: "sys_admin_override",
      transactionId: `TXN_ADMIN_OVERRIDE_${Date.now()}`,
      subscribedAt: new Date(),
      validUntil: null,
    };

    await org.save();

    res.json({
      success: true,
      message: `Organization subscription updated to ${org.subscription.planName}`,
      organization: org,
    });
  } catch (error) {
    console.error("SysAdmin update tenant plan error:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};
