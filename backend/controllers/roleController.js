import Role from "../models/roleModel.js";
import User from "../models/userModel.js";
import { HttpStatus } from "../constants/httpStatus.js";

// Helper to seed default system roles if an organization has none
export const seedDefaultRolesIfNeeded = async (organizationId) => {
  let roles = await Role.find({ organization: organizationId }).sort({ createdAt: 1 });
  if (roles.length === 0) {
    const adminRole = new Role({
      name: "Admin",
      description: "Full administrative access to all workspace resources",
      organization: organizationId,
      isSystemDefault: true,
      permissions: {
        tickets: { create: true, view: true, edit: true, delete: true },
        boards: { create: true, view: true, edit: true, delete: true },
        sprints: { create: true, view: true, manage: true, delete: true },
        team: { invite: true, view: true, approve: true, remove: true },
        settings: { view: true, edit: true },
        roles: { view: true, manage: true },
      },
    });

    const memberRole = new Role({
      name: "Member",
      description: "Standard team member who can create, view, and edit tickets",
      organization: organizationId,
      isSystemDefault: true,
      permissions: {
        tickets: { create: true, view: true, edit: true, delete: false },
        boards: { create: false, view: true, edit: false, delete: false },
        sprints: { create: false, view: true, manage: false, delete: false },
        team: { invite: false, view: true, approve: false, remove: false },
        settings: { view: false, edit: false },
        roles: { view: false, manage: false },
      },
    });

    const viewerRole = new Role({
      name: "Viewer",
      description: "Read-only access to view boards, tickets, and sprints",
      organization: organizationId,
      isSystemDefault: true,
      permissions: {
        tickets: { create: false, view: true, edit: false, delete: false },
        boards: { create: false, view: true, edit: false, delete: false },
        sprints: { create: false, view: true, manage: false, delete: false },
        team: { invite: false, view: true, approve: false, remove: false },
        settings: { view: false, edit: false },
        roles: { view: false, manage: false },
      },
    });

    await Role.insertMany([adminRole, memberRole, viewerRole]);
    roles = await Role.find({ organization: organizationId }).sort({ createdAt: 1 });
  }
  return roles;
};

// GET /api/roles
export const getRoles = async (req, res) => {
  try {
    const organizationId = req.user.organization;
    if (!organizationId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "User does not belong to an organization",
      });
    }

    const roles = await seedDefaultRolesIfNeeded(organizationId);

    // Get count of users assigned to each role
    const rolesWithUserCount = await Promise.all(
      roles.map(async (r) => {
        const userCount = await User.countDocuments({
          organization: organizationId,
          customRole: r._id,
        });
        const obj = r.toObject();
        obj.assignedUserCount = userCount;
        return obj;
      })
    );

    res.json({ success: true, roles: rolesWithUserCount });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to retrieve roles",
    });
  }
};

// POST /api/roles
export const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name || !name.trim()) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Role name is required",
      });
    }

    const existingRole = await Role.findOne({
      organization: req.user.organization,
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });

    if (existingRole) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: `A role named "${name.trim()}" already exists in your organization`,
      });
    }

    const newRole = new Role({
      name: name.trim(),
      description: description?.trim() || "",
      organization: req.user.organization,
      isSystemDefault: false,
      permissions: permissions || {},
    });

    await newRole.save();

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Role created successfully",
      role: newRole,
    });
  } catch (error) {
    console.error("Create role error:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to create role",
    });
  }
};

// PUT /api/roles/:id
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await Role.findOne({
      _id: id,
      organization: req.user.organization,
    });

    if (!role) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Role not found",
      });
    }

    if (name && name.trim() !== role.name) {
      if (role.isSystemDefault) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Cannot rename system default roles",
        });
      }

      const duplicate = await Role.findOne({
        organization: req.user.organization,
        _id: { $ne: role._id },
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      });
      if (duplicate) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: `A role named "${name.trim()}" already exists in your organization`,
        });
      }
      role.name = name.trim();
    }

    if (description !== undefined) role.description = description.trim();
    if (permissions) role.permissions = permissions;

    await role.save();

    res.json({
      success: true,
      message: "Role updated successfully",
      role,
    });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to update role",
    });
  }
};

// DELETE /api/roles/:id
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findOne({
      _id: id,
      organization: req.user.organization,
    });

    if (!role) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Role not found",
      });
    }

    if (role.isSystemDefault) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "System default roles cannot be deleted",
      });
    }

    // Reset customRole on users who have this role
    await User.updateMany(
      { organization: req.user.organization, customRole: role._id },
      { $set: { customRole: null } }
    );

    await Role.deleteOne({ _id: role._id });

    res.json({
      success: true,
      message: `Role "${role.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Delete role error:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to delete role",
    });
  }
};

// PUT /api/roles/assign/:userId
export const assignUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    const user = await User.findOne({
      _id: userId,
      organization: req.user.organization,
    });

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found in organization",
      });
    }

    if (roleId) {
      const roleExists = await Role.findOne({
        _id: roleId,
        organization: req.user.organization,
      });
      if (!roleExists) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: "Role not found",
        });
      }
      user.customRole = roleExists._id;
    } else {
      user.customRole = null;
    }

    await user.save();
    const updated = await User.findById(user._id)
      .select("-password")
      .populate("customRole");

    res.json({
      success: true,
      message: "Role assigned successfully",
      user: updated,
    });
  } catch (error) {
    console.error("Assign role error:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to assign role",
    });
  }
};
