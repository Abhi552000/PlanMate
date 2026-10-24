import Organization from "../models/organizationModel.js";
import User from "../models/userModel.js";
import Task from "../models/taskModel.js";
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

// Get all organizations (System admin only)
export const getAllOrganizations = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res
      .status(HttpStatus.FORBIDDEN)
      .json({ success: false, message: MESSAGES.ORG.SYS_ADMIN_REQUIRED });
  }
  try {
    const orgs = await Organization.find({}).populate("admin", "name email");
    res.json({ success: true, organizations: orgs });
  } catch (error) {
    console.error("Error fetching organizations:", error);
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
