import React, { useEffect, useState, useCallback } from "react";
import { Building } from "lucide-react";
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
    if (!newStatus.trim()) return;
    setAddingStatus(true);
    try {
      const data = await orgService.addCustomStatus(newStatus.trim());
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
