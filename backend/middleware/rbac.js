import { HttpStatus } from "../constants/httpStatus.js";

/**
 * RBAC permission check middleware
 * @param {string} resource - "tickets" | "boards" | "sprints" | "team" | "settings" | "roles"
 * @param {string} action - "create" | "view" | "edit" | "delete" | "manage" | "invite" | "approve" | "remove"
 */
export const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: "Unauthorized" });
    }

    // System Admins and Org Admins have full access to everything
    if (user.role === "system_admin" || user.role === "org_admin") {
      return next();
    }

    // If user has a custom role assigned
    if (user.customRole && user.customRole.permissions) {
      const resourcePerms = user.customRole.permissions[resource];
      if (resourcePerms && resourcePerms[action] === true) {
        return next();
      }
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: `Access denied. Your role does not have permission to ${action} ${resource}.`,
      });
    }

    // Default member fallback permissions if no customRole assigned
    const defaultPermissions = {
      tickets: { create: true, view: true, edit: true, delete: false },
      boards: { create: false, view: true, edit: false, delete: false },
      sprints: { create: false, view: true, manage: false, delete: false },
      team: { invite: false, view: true, approve: false, remove: false },
      settings: { view: false, edit: false },
      roles: { view: false, manage: false },
    };

    if (defaultPermissions[resource]?.[action] === true) {
      return next();
    }

    return res.status(HttpStatus.FORBIDDEN).json({
      success: false,
      message: `Access denied. You do not have permission to ${action} ${resource}.`,
    });
  };
};
