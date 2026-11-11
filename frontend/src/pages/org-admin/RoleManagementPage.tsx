import React, { useEffect, useState, useCallback } from "react";
import { roleService } from "../../services/roleService";
import { IRole, IRolePermissions } from "../../types";
import { toast } from "react-toastify";
import {
  TableCard,
  Table,
  TableHeader,
  TableBody,
  TableHead,
} from "../../components/ui";

interface ResourceRow {
  key: keyof IRolePermissions;
  label: string;
  description: string;
  actions: {
    create?: string;
    view?: string;
    edit?: string;
    delete?: string;
  };
}

const RESOURCES: ResourceRow[] = [
  {
    key: "tickets",
    label: "Tickets",
    description: "Tasks, issues, bugs, and subtasks",
    actions: { create: "create", view: "view", edit: "edit", delete: "delete" },
  },
  {
    key: "boards",
    label: "Boards",
    description: "Workspace environment boards",
    actions: { create: "create", view: "view", edit: "edit", delete: "delete" },
  },
  {
    key: "sprints",
    label: "Sprints",
    description: "Sprint planning and active sprints",
    actions: { create: "create", view: "view", edit: "manage", delete: "delete" },
  },
  {
    key: "team",
    label: "Team Members",
    description: "Member onboarding, approvals, and roles",
    actions: { create: "invite", view: "view", edit: "approve", delete: "remove" },
  },
  {
    key: "settings",
    label: "Workspace Settings",
    description: "Organization settings and board workflows",
    actions: { view: "view", edit: "edit" },
  },
  {
    key: "roles",
    label: "Roles & Permissions",
    description: "Custom role creation and permissions",
    actions: { view: "view", edit: "manage" },
  },
];

export const RoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<IRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);
  const [permissions, setPermissions] = useState<IRolePermissions | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Add Role Form
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const selectRole = (role: IRole) => {
    setSelectedRole(role);
    setRoleName(role.name);
    setRoleDesc(role.description || "");
    setPermissions(JSON.parse(JSON.stringify(role.permissions || {})));
  };

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await roleService.getRoles();
      if (res.success && Array.isArray(res.roles)) {
        setRoles(res.roles);
        if (!selectedRole && res.roles.length > 0) {
          const defaultRole = res.roles.find((r) => r.name === "Member") || res.roles[0];
          selectRole(defaultRole);
        } else if (selectedRole) {
          const fresh = res.roles.find((r) => r._id === selectedRole._id);
          if (fresh) selectRole(fresh);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleToggle = (resourceKey: keyof IRolePermissions, actionKey: string) => {
    if (!permissions || selectedRole?.name === "Admin") return;

    setPermissions((prev: any) => {
      const next = { ...prev };
      if (!next[resourceKey]) next[resourceKey] = {};
      next[resourceKey] = {
        ...next[resourceKey],
        [actionKey]: !next[resourceKey][actionKey],
      };
      return next;
    });
  };

  const handlePreset = (type: "all" | "none" | "member") => {
    if (!permissions || selectedRole?.name === "Admin") return;

    if (type === "all") {
      setPermissions({
        tickets: { create: true, view: true, edit: true, delete: true },
        boards: { create: true, view: true, edit: true, delete: true },
        sprints: { create: true, view: true, manage: true, delete: true },
        team: { invite: true, view: true, approve: true, remove: true },
        settings: { view: true, edit: true },
        roles: { view: true, manage: true },
      });
    } else if (type === "none") {
      setPermissions({
        tickets: { create: false, view: true, edit: false, delete: false },
        boards: { create: false, view: true, edit: false, delete: false },
        sprints: { create: false, view: true, manage: false, delete: false },
        team: { invite: false, view: true, approve: false, remove: false },
        settings: { view: false, edit: false },
        roles: { view: false, manage: false },
      });
    } else if (type === "member") {
      setPermissions({
        tickets: { create: true, view: true, edit: true, delete: false },
        boards: { create: false, view: true, edit: false, delete: false },
        sprints: { create: false, view: true, manage: false, delete: false },
        team: { invite: false, view: true, approve: false, remove: false },
        settings: { view: false, edit: false },
        roles: { view: false, manage: false },
      });
    }
  };

  const handleSave = async () => {
    if (!selectedRole?._id) return;
    try {
      setSaving(true);
      const res = await roleService.updateRole(selectedRole._id, {
        name: selectedRole.isSystemDefault ? undefined : roleName.trim(),
        description: roleDesc.trim(),
        permissions: permissions || {},
      });
      if (res.success && res.role) {
        toast.success(`Role "${res.role.name}" saved successfully`);
        setRoles((prev) => prev.map((r) => (r._id === res.role._id ? res.role : r)));
        setSelectedRole(res.role);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save role");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      setCreating(true);
      const base = {
        tickets: { create: true, view: true, edit: true, delete: false },
        boards: { create: false, view: true, edit: false, delete: false },
        sprints: { create: false, view: true, manage: false, delete: false },
        team: { invite: false, view: true, approve: false, remove: false },
        settings: { view: false, edit: false },
        roles: { view: false, manage: false },
      };

      const res = await roleService.createRole({
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
        permissions: base,
      });

      if (res.success && res.role) {
        toast.success(`Role "${res.role.name}" created`);
        setRoles((prev) => [...prev, res.role]);
        selectRole(res.role);
        setNewRoleName("");
        setNewRoleDesc("");
        setShowAddRole(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create role");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async (role: IRole) => {
    if (!window.confirm(`Are you sure you want to delete role "${role.name}"?`)) return;
    try {
      const res = await roleService.deleteRole(role._id);
      if (res.success) {
        toast.success("Role deleted successfully");
        const remaining = roles.filter((r) => r._id !== role._id);
        setRoles(remaining);
        if (selectedRole?._id === role._id) {
          const fallback = remaining.find((r) => r.name === "Member") || remaining[0];
          if (fallback) selectRole(fallback);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete role");
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-6 font-sans animate-pulse select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 dark:border-gray-800 pb-4">
          <div className="space-y-1.5">
            <div className="h-6 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-3.5 w-72 rounded bg-gray-100 dark:bg-gray-800/60" />
          </div>
        </div>
        <div className="h-64 w-full bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 rounded-xl" />
      </div>
    );
  }

  const isAdmin = selectedRole?.name === "Admin";

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Page Header matching Project Theme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Roles & Permissions
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure workspace roles and permission matrix
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddRole((prev) => !prev)}
          className="px-3.5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          {showAddRole ? "Cancel" : "+ Add Role"}
        </button>
      </div>

      {/* Simple Inline Add Role Form */}
      {showAddRole && (
        <form
          onSubmit={handleCreateRole}
          className="p-4 border border-sky-100 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 flex flex-wrap items-center gap-3 text-xs"
        >
          <input
            type="text"
            required
            placeholder="Role Name (e.g. Lead, QA)"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500"
          />
          <input
            type="text"
            placeholder="Role description"
            value={newRoleDesc}
            onChange={(e) => setNewRoleDesc(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex-1 min-w-[200px] focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg cursor-pointer disabled:opacity-50"
          >
            {creating ? "Creating..." : "Save Role"}
          </button>
        </form>
      )}

      {/* Clean Role Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto">
        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 mr-1 shrink-0 uppercase tracking-wider">
          Role:
        </span>
        {roles.map((r) => {
          const isSelected = selectedRole?._id === r._id;
          return (
            <div key={r._id} className="inline-flex items-center">
              <button
                type="button"
                onClick={() => selectRole(r)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-sky-500 text-white shadow-2xs"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {r.name}
              </button>
              {!r.isSystemDefault && isSelected && (
                <button
                  type="button"
                  onClick={() => handleDeleteRole(r)}
                  className="ml-1 text-[11px] text-rose-500 hover:underline cursor-pointer"
                  title="Delete role"
                >
                  (Delete)
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Role Details and Permissions Matrix */}
      {selectedRole && permissions && (
        <TableCard className="border-sky-100/50 dark:border-gray-800 shadow-sm">
          {/* Header inside Card */}
          <div className="p-4 sm:p-5 border-b border-sky-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {!selectedRole.isSystemDefault ? (
                  <input
                    type="text"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="text-base font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-sky-500"
                  />
                ) : (
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {selectedRole.name} Role
                  </h3>
                )}
                {selectedRole.isSystemDefault && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">
                    Default
                  </span>
                )}
              </div>
              <input
                type="text"
                value={roleDesc}
                disabled={isAdmin}
                onChange={(e) => setRoleDesc(e.target.value)}
                placeholder="Add role description..."
                className="w-full text-xs text-gray-500 dark:text-gray-400 bg-transparent mt-1 focus:outline-none focus:text-gray-700 dark:focus:text-gray-200"
              />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {!isAdmin && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span>Presets:</span>
                  <button
                    type="button"
                    onClick={() => handlePreset("all")}
                    className="hover:underline text-sky-600 dark:text-sky-400 cursor-pointer"
                  >
                    All
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    onClick={() => handlePreset("member")}
                    className="hover:underline text-sky-600 dark:text-sky-400 cursor-pointer"
                  >
                    Default
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    onClick={() => handlePreset("none")}
                    className="hover:underline text-sky-600 dark:text-sky-400 cursor-pointer"
                  >
                    Read Only
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || isAdmin}
                className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                {saving ? "Saving..." : "Save Permissions"}
              </button>
            </div>
          </div>

          {/* Simple Standard Table List */}
          <Table>
            <TableHeader>
              <tr>
                <TableHead className="py-3 px-5">Resource</TableHead>
                <TableHead className="py-3 px-4 text-center w-28">Create</TableHead>
                <TableHead className="py-3 px-4 text-center w-28">View</TableHead>
                <TableHead className="py-3 px-4 text-center w-28">Edit</TableHead>
                <TableHead className="py-3 px-4 text-center w-28">Delete</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {RESOURCES.map((res) => {
                const resPerms: any = (permissions as any)[res.key] || {};

                const renderToggle = (actionName: string | undefined) => {
                  if (!actionName) {
                    return <span className="text-gray-300 dark:text-gray-700 select-none">—</span>;
                  }
                  const isEnabled = isAdmin ? true : Boolean(resPerms[actionName]);
                  return (
                    <button
                      type="button"
                      disabled={isAdmin}
                      onClick={() => handleToggle(res.key, actionName)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:cursor-not-allowed ${
                        isEnabled ? "bg-sky-500" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                      aria-label={`${res.label} ${actionName}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isEnabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  );
                };

                return (
                  <tr
                    key={res.key}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {res.label}
                      </div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500">
                        {res.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderToggle(res.actions.create)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderToggle(res.actions.view)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderToggle(res.actions.edit)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {renderToggle(res.actions.delete)}
                    </td>
                  </tr>
                );
              })}
            </TableBody>
          </Table>
        </TableCard>
      )}
    </div>
  );
};

export default RoleManagementPage;
