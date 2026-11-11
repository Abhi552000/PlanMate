import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { orgService } from "../services/orgService";
import { taskService } from "../services/taskService";
import { boardService } from "../services/boardService";
import { useBoard } from "../context/BoardContext";
import { ROUTES } from "../constants/routeConstant";
import { IUser, IBoard } from "../types";
import { TOAST_MESSAGES, CONSOLE_ERRORS } from "../constants/messages";
import { WORKSPACE_SETTINGS_TEXTS } from "../constants/uiTexts";
import { toast } from "react-toastify";
import { WorkspaceBrandingForm } from "./workspace-settings/WorkspaceBrandingForm";
import { ConfirmDeleteStatusModal } from "./workspace-settings/ConfirmDeleteStatusModal";
import { BoardManagementPanel } from "./workspace-settings/BoardManagementPanel";
import { IBoardFeatures, ICustomField } from "../types/organization";

const WorkspaceSettings = () => {
  const navigate = useNavigate();
  const { boards, currentBoard, refreshBoards } = useBoard();
  const [currentUser] = useState<IUser | null>(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  const isOrgAdmin = currentUser?.role === "org_admin";

  const [orgData, setOrgData] = useState({
    name: "",
    description: "",
  });

  // Selected board being configured
  const [selectedBoard, setSelectedBoard] = useState<IBoard | null>(null);

  const [statuses, setStatuses] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>(["Low", "Medium", "High"]);
  const [boardFeatures, setBoardFeatures] = useState<IBoardFeatures>({
    storyPoints: true,
    timeTracking: true,
    dueDates: true,
    labels: true,
    subtasks: true,
    issueLinking: true,
  });
  const [customFields, setCustomFields] = useState<ICustomField[]>([]);

  const [newStatus, setNewStatus] = useState("");
  const [addingStatus, setAddingStatus] = useState(false);
  const [deletingStatus, setDeletingStatus] = useState<string | null>(null);
  const [statusToDelete, setStatusToDelete] = useState<string | null>(null);
  const [tasksCountForStatus, setTasksCountForStatus] = useState<number | null>(null);
  const [isCheckingTasks, setIsCheckingTasks] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingOrg, setSavingOrg] = useState(false);

  // Sync selected board data when selectedBoard changes
  useEffect(() => {
    if (selectedBoard) {
      setStatuses(selectedBoard.statuses || ["To Do", "In Progress", "Done"]);
      setPriorities(selectedBoard.priorities || ["Low", "Medium", "High", "Critical"]);
      setBoardFeatures(
        selectedBoard.boardFeatures || {
          storyPoints: true,
          timeTracking: true,
          dueDates: true,
          labels: true,
          subtasks: true,
          issueLinking: true,
        }
      );
      setCustomFields(selectedBoard.customFields || []);
    }
  }, [selectedBoard]);

  // Initial selection of board
  useEffect(() => {
    if (boards.length > 0 && !selectedBoard) {
      const active = currentBoard || boards[0];
      setSelectedBoard(active);
    }
  }, [boards, currentBoard, selectedBoard]);

  const fetchOrgDetails = async () => {
    try {
      const data = await orgService.getOrgDetails();
      if (data?.success && data?.organization) {
        setOrgData({
          name: data.organization.name || "",
          description: data.organization.description || "",
        });
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
      toast.error("This status already exists on this board");
      return;
    }
    setAddingStatus(true);
    try {
      const updatedStatuses = [...statuses, trimmed];
      if (selectedBoard) {
        const res = await boardService.updateBoard(selectedBoard._id, {
          statuses: updatedStatuses,
        });
        if (res.success && res.board) {
          setStatuses(res.board.statuses);
          setSelectedBoard(res.board);
          await refreshBoards();
          setNewStatus("");
          toast.success(`Status "${trimmed}" added to ${selectedBoard.name}!`);
        }
      } else {
        const data = await orgService.addCustomStatus(trimmed);
        if (data?.success) {
          setStatuses(data.statuses);
          setNewStatus("");
          toast.success(TOAST_MESSAGES.WORKSPACE_STATUS_ADD_SUCCESS);
        }
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
      const params = selectedBoard ? new URLSearchParams({ boardId: selectedBoard._id }) : undefined;
      const data = await taskService.getTasks(params);
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
      const updatedStatuses = statuses.filter((s) => s !== statusToDeleteName);
      if (selectedBoard) {
        const res = await boardService.updateBoard(selectedBoard._id, {
          statuses: updatedStatuses,
        });
        if (res.success && res.board) {
          setStatuses(res.board.statuses);
          setSelectedBoard(res.board);
          await refreshBoards();
          toast.success(`Status "${statusToDeleteName}" removed from ${selectedBoard.name}`);
          setStatusToDelete(null);
        }
      } else {
        const data = await orgService.deleteCustomStatus(statusToDeleteName);
        if (data?.success) {
          setStatuses(data.statuses);
          toast.success(TOAST_MESSAGES.WORKSPACE_STATUS_DEL_SUCCESS);
          setStatusToDelete(null);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.WORKSPACE_STATUS_DEL_ERROR);
    } finally {
      setDeletingStatus(null);
    }
  };

  const handleFeaturesUpdated = async (features: IBoardFeatures) => {
    setBoardFeatures(features);
    if (selectedBoard) {
      try {
        const res = await boardService.updateBoard(selectedBoard._id, {
          boardFeatures: features,
        });
        if (res.success && res.board) {
          setSelectedBoard(res.board);
          await refreshBoards();
          toast.success(`Feature visibility updated for ${selectedBoard.name}`);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update board features");
      }
    } else {
      await orgService.updateBoardFeatures(features);
    }
  };

  const handlePrioritiesUpdated = async (updatedPriorities: string[]) => {
    setPriorities(updatedPriorities);
    if (selectedBoard) {
      try {
        const res = await boardService.updateBoard(selectedBoard._id, {
          priorities: updatedPriorities,
        });
        if (res.success && res.board) {
          setSelectedBoard(res.board);
          await refreshBoards();
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update priorities");
      }
    }
  };

  const handleCustomFieldsUpdated = async (updatedFields: ICustomField[]) => {
    setCustomFields(updatedFields);
    if (selectedBoard) {
      try {
        const res = await boardService.updateBoard(selectedBoard._id, {
          customFields: updatedFields,
        });
        if (res.success && res.board) {
          setSelectedBoard(res.board);
          await refreshBoards();
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to update custom fields");
      }
    }
  };

  const loadWorkspaceSettings = useCallback(async () => {
    setLoading(true);
    try {
      await fetchOrgDetails();
      await refreshBoards();
    } catch (err) {
      console.error(CONSOLE_ERRORS.LOAD_SETTINGS, err);
    } finally {
      setLoading(false);
    }
  }, [refreshBoards]);

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
      toast.error(TOAST_MESSAGES.WORKSPACE_NAME_REQUIRED);
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

  // Dynamic contextual descriptions for each workspace section
  const dynamicDescriptions = useMemo(() => {
    const orgName = orgData.name?.trim() || "your organization";
    const bName = selectedBoard?.name || "Active Board";
    const bKey = selectedBoard?.key || "KEY";
    const bEnv = selectedBoard?.environment || "ENV";
    const enabledCount = Object.values(boardFeatures).filter(Boolean).length;
    const boardKeysList = boards.map((b) => b.key).filter(Boolean).join(", ");

    return {
      general: `Configure organization identity, workspace name, and branding details for ${orgName}.`,
      boards: `Managing ${boards.length} environment board${
        boards.length === 1 ? "" : "s"
      }${boardKeysList ? ` (${boardKeysList})` : ""}. Click any board below or use the selector to customize workflows.`,
      requiredFields: `Core built-in attributes required on every ticket across ${bName} (${bKey}).`,
      workflow: `Configuring ${statuses.length} workflow stage${
        statuses.length === 1 ? "" : "s"
      } and ${priorities.length} priority level${
        priorities.length === 1 ? "" : "s"
      } for ${bName} (${bKey} - ${bEnv}).`,
      features: `${enabledCount} of 6 optional tools currently enabled for ${bName}. Toggle tools to fit your team's workflow.`,
      customFields: `${customFields.length} custom field${
        customFields.length === 1 ? "" : "s"
      } configured for tickets on ${bName} (${bKey}).`,
    };
  }, [
    orgData.name,
    boards,
    selectedBoard?.name,
    selectedBoard?.key,
    selectedBoard?.environment,
    statuses.length,
    priorities.length,
    boardFeatures,
    customFields.length,
  ]);

  if (loading) {
    return (
      <div className="w-full space-y-6 font-sans animate-pulse select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-1.5">
              <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-3.5 w-72 rounded bg-slate-100 dark:bg-slate-800/60" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-sky-100/60 dark:border-slate-800 p-6 rounded-xl shadow-xs space-y-4">
            <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-3">
              <div className="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
              <div className="h-24 w-full rounded-lg bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-sky-100/60 dark:border-slate-800 p-6 rounded-xl shadow-xs space-y-4">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            {WORKSPACE_SETTINGS_TEXTS.PAGE_TITLE}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {WORKSPACE_SETTINGS_TEXTS.PAGE_SUBTITLE}
          </p>
        </div>
      </div>

      {/* 1. Workspace General Branding Form */}
      <WorkspaceBrandingForm
        orgData={orgData}
        savingOrg={savingOrg}
        handleOrgChange={handleOrgChange}
        handleUpdateOrg={handleUpdateOrg}
        dynamicDescription={dynamicDescriptions.general}
      />

      {/* 2. Environment Boards & Workflows (Accordion List with Selector Dropdown & Modify/Delete Icons) */}
      <BoardManagementPanel
        selectedBoard={selectedBoard}
        onSelectBoard={(board) => setSelectedBoard(board)}
        dynamicDescription={dynamicDescriptions.boards}
        statuses={statuses}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        addingStatus={addingStatus}
        handleAddStatus={handleAddStatus}
        handleOpenDeleteModal={handleOpenDeleteModal}
        boardFeatures={boardFeatures}
        priorities={priorities}
        customFields={customFields}
        onFeaturesUpdated={handleFeaturesUpdated}
        onPrioritiesUpdated={handlePrioritiesUpdated}
        onCustomFieldsUpdated={handleCustomFieldsUpdated}
        dynamicDescriptions={dynamicDescriptions}
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
