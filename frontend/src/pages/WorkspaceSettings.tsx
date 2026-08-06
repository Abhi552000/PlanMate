import React, { useEffect, useState } from "react";
import { Building, Settings, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { orgService } from "../services/orgService";
import { taskService } from "../services/taskService";
import { ROUTES } from "../constants/routeConstant";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { IUser } from "../types";

const WorkspaceSettings = () => {
  const navigate = useNavigate();
  const [currentUser] = useState<IUser | null>(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  const isOrgAdmin = currentUser?.role === "org_admin";

  const [orgData, setOrgData] = useState({
    name: "",
    description: "",
  });

  const [statuses, setStatuses] = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState("");
  const [addingStatus, setAddingStatus] = useState(false);
  const [deletingStatus, setDeletingStatus] = useState<string | null>(null);
  const [statusToDelete, setStatusToDelete] = useState<string | null>(null);
  const [tasksCountForStatus, setTasksCountForStatus] = useState<number | null>(null);
  const [isCheckingTasks, setIsCheckingTasks] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingOrg, setSavingOrg] = useState(false);

  const fetchOrgDetails = async () => {
    try {
      const data = await orgService.getOrgDetails();
      if (data?.success && data?.organization) {
        setOrgData({
          name: data.organization.name || "",
          description: data.organization.description || "",
        });
        setStatuses(data.organization.statuses || ["To Do", "In Progress", "Done"]);
      }
    } catch (err) {
      console.error("Error fetching org details:", err);
      toast.error("Failed to load workspace details.");
    }
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus.trim()) return;
    setAddingStatus(true);
    try {
      const data = await orgService.addCustomStatus(newStatus.trim());
      if (data?.success) {
        setStatuses(data.statuses);
        setNewStatus("");
        toast.success("Custom status added successfully!");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to add status.");
    } finally {
      setAddingStatus(false);
    }
  };

  const handleOpenDeleteModal = async (statusName: string) => {
    setStatusToDelete(statusName);
    setIsCheckingTasks(true);
    setTasksCountForStatus(null);
    try {
      const data = await taskService.getTasks();
      if (data?.success && data?.tasks) {
        const count = data.tasks.filter((t: any) => t.status === statusName).length;
        setTasksCountForStatus(count);
      } else {
        setTasksCountForStatus(0);
      }
    } catch (err) {
      console.error("Error checking status task counts:", err);
      setTasksCountForStatus(0);
    } finally {
      setIsCheckingTasks(false);
    }
  };

  const handleDeleteStatus = async (statusToDeleteName: string) => {
    setDeletingStatus(statusToDeleteName);
    try {
      const data = await orgService.deleteCustomStatus(statusToDeleteName);
      if (data?.success) {
        setStatuses(data.statuses);
        toast.success("Custom status deleted successfully!");
        setStatusToDelete(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete status.");
    } finally {
      setDeletingStatus(null);
    }
  };

  useEffect(() => {
    if (!isOrgAdmin) {
      navigate(ROUTES.DASHBOARD);
      return;
    }
    const load = async () => {
      setLoading(true);
      await fetchOrgDetails();
      setLoading(false);
    };
    load();
  }, [isOrgAdmin, navigate]);

  const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOrg(true);
    try {
      const data = await orgService.updateOrgDetails(orgData);
      if (data?.success) {
        toast.success("Workspace settings updated successfully!");
        if (currentUser) {
          const updatedUser: IUser = {
            ...currentUser,
            organizationName: orgData.name,
          };
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to update workspace settings."
      );
    } finally {
      setSavingOrg(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-semibold">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl text-white shadow-md">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Workspace Settings
            </h1>
            <p className="text-xs font-semibold text-gray-400">
              Configure name, description, branding and details of your team
              space.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm">
        <form onSubmit={handleUpdateOrg} className="space-y-4">
          <div className="flex items-center justify-between border-b border-sky-100 dark:border-gray-800 pb-3 mb-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250 flex items-center gap-2">
              <Building className="w-4.5 h-4.5 text-sky-500" /> Workspace Branding
            </h3>
            <Button
              type="submit"
              loading={savingOrg}
              icon={<Building className="w-4.5 h-4.5" />}
              size="sm"
            >
              Save Settings
            </Button>
          </div>

          <Input
            label="Workspace Name"
            type="text"
            name="name"
            value={orgData.name}
            onChange={handleOrgChange}
            placeholder="e.g. TCS Solutions, Pepsi Co"
            required
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Workspace Description
            </label>
            <textarea
              name="description"
              value={orgData.description}
              onChange={handleOrgChange}
              rows={4}
              className="w-full px-3.5 py-2.5 border border-sky-100 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-gray-700 dark:text-gray-300 font-medium"
              placeholder="Define the scope, goals and branding guidelines of this workspace..."
            />
          </div>
        </form>
      </div>

      {/* Custom Statuses Settings */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250 flex items-center gap-2 border-b border-sky-100 dark:border-gray-800 pb-3">
          <Settings className="w-4.5 h-4.5 text-sky-500" /> Custom Task Statuses
        </h3>

        <form onSubmit={handleAddStatus} className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Add new status (e.g. Ready for QA)"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            required
            wrapperClassName="flex-1"
          />
          <Button
            type="submit"
            disabled={!newStatus.trim()}
            loading={addingStatus}
            variant="secondary"
            className="h-[44px]"
          >
            Add Status
          </Button>
        </form>

        <div className="pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Active Workspace Statuses
          </label>
          <div className="flex flex-wrap gap-2.5">
            {statuses.map((status) => (
              <div
                key={status}
                className="flex items-center gap-2 px-3 py-1.5 bg-sky-50/50 dark:bg-gray-850 rounded-xl border border-sky-100/55 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 shadow-sm"
              >
                <span>{status}</span>
                <button
                  type="button"
                  onClick={() => handleOpenDeleteModal(status)}
                  className="text-red-400 hover:text-red-650 transition-colors p-0.5 rounded cursor-pointer"
                  title={`Delete status "${status}"`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {statusToDelete && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-sky-100 dark:border-gray-800 max-w-sm w-full p-6 space-y-4 animate-scaleUp animate-duration-150">
            <h3 className="font-bold text-gray-850 dark:text-gray-150 text-base">
              Confirm Status Deletion
            </h3>

            {isCheckingTasks ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className="w-6 h-6 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                <p className="text-xs text-gray-400 font-semibold">Checking workspace tasks...</p>
              </div>
            ) : tasksCountForStatus !== null && tasksCountForStatus > 0 ? (
              <div className="space-y-3">
                <div className="bg-red-50/50 dark:bg-red-950/15 border border-red-100 dark:border-red-900/50 p-3 rounded-xl text-xs text-red-700 dark:text-red-400 font-semibold leading-relaxed">
                  ⚠️ Cannot delete status <strong>"{statusToDelete}"</strong> because it is currently assigned to <strong>{tasksCountForStatus} task(s)</strong> in this workspace. You must move or reassign these tasks before you can remove this status.
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-550 dark:text-gray-400 leading-normal">
                Are you sure you want to delete the status <strong>"{statusToDelete}"</strong>? Tasks currently in this status will fall back to their default workflow. This action cannot be undone.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-sky-50 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setStatusToDelete(null);
                  setTasksCountForStatus(null);
                }}
                className="px-4 py-2 border border-sky-200 dark:border-gray-800 text-gray-650 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-800 font-bold rounded-lg text-xs transition-colors cursor-pointer bg-white dark:bg-gray-900"
              >
                {tasksCountForStatus !== null && tasksCountForStatus > 0 ? "Close" : "Cancel"}
              </button>
              {!(tasksCountForStatus !== null && tasksCountForStatus > 0) && (
                <button
                  type="button"
                  disabled={deletingStatus !== null || isCheckingTasks}
                  onClick={() => handleDeleteStatus(statusToDelete)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50"
                >
                  {deletingStatus ? "Deleting..." : "Confirm Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSettings;
