import Organization from "../models/organizationModel.js";
import User from "../models/userModel.js";
import Task from "../models/taskModel.js";
import bcrypt from "bcrypt";
import validator from "validator";

// Onboard a new organization (System Admin or Public Onboarding)
export const onboardOrganization = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res.status(403).json({ success: false, message: "Access denied. System admin only." });
  }
  const { orgName, adminName, adminEmail, adminPassword } = req.body;

  if (!orgName || !adminName || !adminEmail) {
    return res.status(400).json({ success: false, message: "Organization Name, Admin Name and Admin Email are required" });
  }

  if (!validator.isEmail(adminEmail)) {
    return res.status(400).json({ success: false, message: "Invalid email address" });
  }

  // Generate random password if not provided
  const generatedPassword = adminPassword || (Math.random().toString(36).slice(-8) + "!");

  if (generatedPassword.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  try {
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Admin user already exists" });
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

    res.status(201).json({
      success: true,
      message: "Organization onboarded successfully",
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
    res.status(500).json({ success: false, message: "Server error during onboarding" });
  }
};

// Get current organization info
export const getOrganizationInfo = async (req, res) => {
  try {
    if (!req.user.organization) {
      return res.status(404).json({ success: false, message: "User is not associated with any organization" });
    }
    const org = await Organization.findById(req.user.organization).populate("admin", "name email");
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }
    res.json({ success: true, organization: org });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error fetching organization" });
  }
};

// Update organization info (Org Admin only)
export const updateOrganizationInfo = async (req, res) => {
  const { name, description } = req.body;

  if (req.user.role !== "org_admin") {
    return res.status(403).json({ success: false, message: "Only organization admins can perform this action" });
  }

  if (!name) {
    return res.status(400).json({ success: false, message: "Organization name is required" });
  }

  try {
    const updated = await Organization.findByIdAndUpdate(
      req.user.organization,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    res.json({ success: true, message: "Organization updated successfully", organization: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error updating organization" });
  }
};

// Add a member to organization (Org Admin only)
export const addOrganizationMember = async (req, res) => {
  const { name, email, password } = req.body;

  if (req.user.role !== "org_admin") {
    return res.status(403).json({ success: false, message: "Only organization admins can add members" });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email address" });
  }

  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const member = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "member",
      organization: req.user.organization,
    });

    res.status(201).json({
      success: true,
      message: "Member added successfully",
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        role: member.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error adding member" });
  }
};

// Get all members in organization
export const getOrganizationMembers = async (req, res) => {
  try {
    if (!req.user.organization) {
      return res.status(404).json({ success: false, message: "User has no organization context" });
    }
    const members = await User.find({ organization: req.user.organization, status: "active" }).select("name email role");
    res.json({ success: true, members });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error fetching members" });
  }
};

// Get all organizations (System admin only)
export const getAllOrganizations = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res.status(403).json({ success: false, message: "Access denied. System admin only." });
  }
  try {
    const orgs = await Organization.find({}).populate("admin", "name email");
    res.json({ success: true, organizations: orgs });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ success: false, message: "Server error fetching organizations" });
  }
};

// Delete Organization (System Admin cascades delete tasks, users and org document)
export const deleteOrganization = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res.status(403).json({ success: false, message: "Access denied. System admin only." });
  }

  const { id } = req.params;

  try {
    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    // Cascade delete tasks
    await Task.deleteMany({ organization: id });

    // Cascade delete users
    await User.deleteMany({ organization: id });

    // Delete organization itself
    await Organization.findByIdAndDelete(id);

    res.json({ success: true, message: "Organization and all associated users and tasks deleted successfully" });
  } catch (error) {
    console.error("Delete org error:", error);
    res.status(500).json({ success: false, message: "Server error deleting organization" });
  }
};

// Update Organization Admin details (System Admin)
export const updateOrganizationAdmin = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res.status(403).json({ success: false, message: "Access denied. System admin only." });
  }

  const { id } = req.params;
  const { orgName, adminName, adminEmail, adminPassword } = req.body;

  try {
    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
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
          return res.status(400).json({ success: false, message: "Email is already in use by another user" });
        }
        adminUser.email = adminEmail;
      }
      if (adminPassword) {
        if (adminPassword.length < 8) {
          return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }
        adminUser.password = await bcrypt.hash(adminPassword, 10);
      }
      await adminUser.save();
    }

    res.json({ success: true, message: "Organization and admin settings updated successfully" });
  } catch (error) {
    console.error("Update org error:", error);
    res.status(500).json({ success: false, message: "Server error updating organization" });
  }
};

// Update Organization active status and remark (System Admin)
export const updateOrganizationStatus = async (req, res) => {
  if (req.user?.role !== "system_admin") {
    return res.status(403).json({ success: false, message: "Access denied. System admin only." });
  }

  const { id } = req.params;
  const { isActive, remark } = req.body;

  try {
    const org = await Organization.findById(id);
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    if (isActive !== undefined) {
      org.isActive = isActive;
    }
    if (remark !== undefined) {
      org.remark = remark;
    }

    await org.save();

    res.json({ success: true, message: "Organization status updated successfully", organization: org });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ success: false, message: "Server error updating status" });
  }
};

// Get public organization list for signup dropdown
export const getPublicOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.find({ isActive: true }).select("name");
    res.json({ success: true, organizations: orgs });
  } catch (error) {
    console.error("Public list error:", error);
    res.status(500).json({ success: false, message: "Server error fetching public organizations" });
  }
};

// Get organization users with stats (solved tickets count)
export const getOrganizationUsers = async (req, res) => {
  try {
    if (!req.user.organization) {
      return res.status(404).json({ success: false, message: "User has no organization context" });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const totalCount = await User.countDocuments({ organization: req.user.organization });
    const users = await User.find({ organization: req.user.organization })
      .select("name email role status statusRemark createdAt")
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
    res.status(500).json({ success: false, message: "Server error fetching organization users" });
  }
};

// Update user approval status (Org Admin only)
export const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { status, remark } = req.body;

  if (req.user.role !== "org_admin") {
    return res.status(403).json({ success: false, message: "Only organization admins can manage users status" });
  }

  if (!["active", "rejected"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }

  try {
    const userToUpdate = await User.findOne({ _id: userId, organization: req.user.organization });
    if (!userToUpdate) {
      return res.status(404).json({ success: false, message: "User not found in your organization" });
    }

    userToUpdate.status = status;
    userToUpdate.statusRemark = remark || "";
    await userToUpdate.save();

    res.json({ success: true, message: `User status successfully updated to ${status}` });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({ success: false, message: "Server error updating status" });
  }
};

// Add a custom status to organization (Org Admin only)
export const addCustomStatus = async (req, res) => {
  const { status } = req.body;

  if (req.user.role !== "org_admin") {
    return res.status(403).json({ success: false, message: "Only organization admins can add statuses" });
  }

  if (!status || !status.trim()) {
    return res.status(400).json({ success: false, message: "Status name is required" });
  }

  const trimmedStatus = status.trim();

  try {
    const org = await Organization.findById(req.user.organization);
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    // Initialize statuses if not present
    if (!org.statuses || org.statuses.length === 0) {
      org.statuses = ["To Do", "In Progress", "Done"];
    }

    // Check for duplicate status (case-insensitive)
    const exists = org.statuses.some(s => s.toLowerCase() === trimmedStatus.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: `Status "${trimmedStatus}" already exists` });
    }

    org.statuses.push(trimmedStatus);
    await org.save();

    res.json({ success: true, message: "Status added successfully", statuses: org.statuses });
  } catch (error) {
    console.error("Add custom status error:", error);
    res.status(500).json({ success: false, message: "Server error adding custom status" });
  }
};

// Delete a custom status from organization (Org Admin only)
export const deleteCustomStatus = async (req, res) => {
  const { statusName } = req.params;

  if (req.user.role !== "org_admin") {
    return res.status(403).json({ success: false, message: "Only organization admins can delete statuses" });
  }

  try {
    const org = await Organization.findById(req.user.organization);
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    // Initialize statuses if not present
    if (!org.statuses || org.statuses.length === 0) {
      org.statuses = ["To Do", "In Progress", "Done"];
    }

    // Enforce that we don't delete if there is only 1 status left
    if (org.statuses.length <= 1) {
      return res.status(400).json({ success: false, message: "Organization must have at least one status" });
    }

    // Check if status exists in org
    const index = org.statuses.findIndex(s => s.toLowerCase() === statusName.toLowerCase());
    if (index === -1) {
      return res.status(404).json({ success: false, message: "Status not found in organization" });
    }

    // CRITICAL INTEGRITY CHECK: Check if any tasks in this organization use this status
    const matchingStatusName = org.statuses[index];
    const taskCount = await Task.countDocuments({
      organization: req.user.organization,
      status: matchingStatusName
    });

    if (taskCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete status "${matchingStatusName}" because it is currently assigned to ${taskCount} task(s)`
      });
    }

    // Filter out the status
    org.statuses.splice(index, 1);
    await org.save();

    res.json({ success: true, message: "Status deleted successfully", statuses: org.statuses });
  } catch (error) {
    console.error("Delete custom status error:", error);
    res.status(500).json({ success: false, message: "Server error deleting custom status" });
  }
};
