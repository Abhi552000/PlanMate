import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { orgService } from "../services/orgService";
import { taskService } from "../services/taskService";
import { ROUTES } from "../constants/routeConstant";
import { IUser } from "../types";
import { TOAST_MESSAGES, CONSOLE_ERRORS } from "../constants/messages";
import { toast } from "react-toastify";
import { WorkspaceBrandingForm } from "./workspace-settings/WorkspaceBrandingForm";
import { CustomStatusesSettings } from "./workspace-settings/CustomStatusesSettings";
import { ConfirmDeleteStatusModal } from "./workspace-settings/ConfirmDeleteStatusModal";

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
      console.error(CONSOLE_ERRORS.FETCH_ORG_DETAILS, err);
      toast.error(TOAST_MESSAGES.WORKSPACE_LOAD_ERROR);
    }
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newStatus.trim();
    if (!trimmed) {
      toast.error("Status name cannot be empty");
      return;
    }
    if (statuses.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("This status already exists in your workspace");
      return;
    }
    setAddingStatus(true);
    try {
      const data = await orgService.addCustomStatus(trimmed);
      if (data?.success) {
        setStatuses(data.statuses);
        setNewStatus("");
        toast.success(TOAST_MESSAGES.WORKSPACE_STATUS_ADD_SUCCESS);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.WORKSPACE_STATUS_ADD_ERROR);
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
      console.error(CONSOLE_ERRORS.CHECK_STATUS_COUNTS, err);
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
        toast.success(TOAST_MESSAGES.WORKSPACE_STATUS_DEL_SUCCESS);
        setStatusToDelete(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.WORKSPACE_STATUS_DEL_ERROR);
    } finally {
      setDeletingStatus(null);
    }
  };

  const loadWorkspaceSettings = useCallback(async () => {
    setLoading(true);
    try {
      await fetchOrgDetails();
    } catch (err) {
      console.error(CONSOLE_ERRORS.LOAD_SETTINGS, err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOrgAdmin) {
      navigate(ROUTES.DASHBOARD);
      return;
    }
    loadWorkspaceSettings();
  }, [isOrgAdmin, navigate, loadWorkspaceSettings]);

  const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgData.name.trim()) {
      toast.error("Workspace name cannot be empty");
      return;
    }
    setSavingOrg(true);
    try {
      const data = await orgService.updateOrgDetails(orgData);
      if (data?.success) {
        toast.success(TOAST_MESSAGES.WORKSPACE_UPDATE_SUCCESS);
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
        err?.response?.data?.message || TOAST_MESSAGES.WORKSPACE_UPDATE_ERROR
      );
    } finally {
      setSavingOrg(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-6 font-sans animate-pulse select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-3.5 w-72 rounded bg-slate-100 dark:bg-slate-800/60" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-6 rounded-2xl shadow-xs space-y-4">
            <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-3">
              <div className="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
              <div className="h-24 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-sky-100/60 dark:border-gray-800 p-6 rounded-2xl shadow-xs space-y-4">
            <div className="h-5 w-36 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-800/60" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Workspace Settings
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure name, description, branding and details of your team space.
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <WorkspaceBrandingForm
        orgData={orgData}
        savingOrg={savingOrg}
        handleOrgChange={handleOrgChange}
        handleUpdateOrg={handleUpdateOrg}
      />

      {/* Custom Statuses Settings */}
      <CustomStatusesSettings
        statuses={statuses}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        addingStatus={addingStatus}
        handleAddStatus={handleAddStatus}
        handleOpenDeleteModal={handleOpenDeleteModal}
      />

      {/* Delete Status Confirmation Modal */}
      <ConfirmDeleteStatusModal
        statusToDelete={statusToDelete}
        isCheckingTasks={isCheckingTasks}
        tasksCountForStatus={tasksCountForStatus}
        deletingStatus={deletingStatus}
        setStatusToDelete={setStatusToDelete}
        setTasksCountForStatus={setTasksCountForStatus}
        handleDeleteStatus={handleDeleteStatus}
      />
    </div>
  );
};

export default WorkspaceSettings;
