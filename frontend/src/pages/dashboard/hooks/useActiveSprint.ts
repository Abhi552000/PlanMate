import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../store";
import { fetchSprints, updateSprint } from "../../../store/slices/sprintSlice";
import { fetchEpics } from "../../../store/slices/epicSlice";
import { updateTask } from "../../../store/slices/taskSlice";
import { orgService } from "../../../services/orgService";
import { ITask } from "../../../types";
import { TOAST_MESSAGES } from "../../../constants/messages";
import { getRemainingDaysText } from "../../../utils";
import { getCachedStatuses, setCachedStatuses } from "../../../utils/statusUtils";

export const useActiveSprint = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeSprint = useAppSelector((state) => state.sprints.activeSprint);
  const epics = useAppSelector((state) => state.epics.epics);
  const loading = useAppSelector((state) => state.sprints.loading || state.epics.loading);
  const [statuses, setStatuses] = useState<string[]>(getCachedStatuses);
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [completingSprint, setCompletingSprint] = useState(false);

  // Grouping & Filters
  const [groupByEpic, setGroupByEpic] = useState(false);
  const [onlyMyIssues, setOnlyMyIssues] = useState(false);
  const [highPriorityOnly, setHighPriorityOnly] = useState(false);

  // Task Edit Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskToEdit, setSelectedTaskToEdit] = useState<ITask | null>(null);

  const loadData = useCallback(async () => {
    try {
      await dispatch(fetchSprints()).unwrap();
      await dispatch(fetchEpics()).unwrap();
      const orgRes = await orgService.getOrgDetails();
      if (orgRes?.success && Array.isArray(orgRes?.organization?.statuses) && orgRes.organization.statuses.length > 0) {
        setCachedStatuses(orgRes.organization.statuses);
        setStatuses(orgRes.organization.statuses);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(TOAST_MESSAGES.ACTIVE_SPRINT_LOAD_ERROR);
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Complete Sprint
  const handleCompleteSprint = () => {
    if (!activeSprint) return;
    setShowConfirmComplete(true);
  };

  const handleConfirmComplete = async () => {
    if (!activeSprint) return;
    setCompletingSprint(true);
    try {
      await dispatch(updateSprint({ id: activeSprint._id, sprintData: { status: "completed" } })).unwrap();
      toast.success(TOAST_MESSAGES.SPRINT_COMPLETE_SUCCESS);
      setShowConfirmComplete(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || TOAST_MESSAGES.SPRINT_COMPLETE_ERROR);
    } finally {
      setCompletingSprint(false);
    }
  };

  // Move Task Status
  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await dispatch(updateTask({ id: taskId, taskData: { status: newStatus } })).unwrap();
      toast.success(TOAST_MESSAGES.TASK_STATUS_UPDATE_SUCCESS(newStatus));
      loadData();
    } catch (err: any) {
      toast.error(TOAST_MESSAGES.TASK_STATUS_UPDATE_ERROR);
    }
  };

  // Get current logged-in user id
  const currentUserId = useMemo(() => {
    const cur = JSON.parse(localStorage.getItem("currentUser") || "{}");
    return cur.id || "";
  }, []);

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    if (!activeSprint || !activeSprint.tasks) return [];
    let items = [...activeSprint.tasks];

    if (onlyMyIssues && currentUserId) {
      items = items.filter(t => {
        const assigneeId = typeof t.assignee === "object" && t.assignee ? (t.assignee as any)._id : t.assignee;
        return assigneeId === currentUserId;
      });
    }

    if (highPriorityOnly) {
      items = items.filter(t => t.priority === "High");
    }

    return items;
  }, [activeSprint, onlyMyIssues, highPriorityOnly, currentUserId]);

  // Group tasks by Epic
  const tasksByEpic = useMemo(() => {
    const map: Record<string, ITask[]> = { unassigned: [] };
    epics.forEach(e => { map[e._id] = []; });

    filteredTasks.forEach(task => {
      const epicId = typeof task.epic === "object" && task.epic ? (task.epic as any)._id : task.epic;
      if (epicId && map[epicId]) {
        map[epicId].push(task);
      } else {
        map.unassigned.push(task);
      }
    });

    return map;
  }, [filteredTasks, epics]);

  // Compute Remaining Days
  const remainingDays = useMemo(() => {
    return getRemainingDaysText(activeSprint?.endDate);
  }, [activeSprint]);

  return {
    navigate,
    activeSprint,
    epics,
    loading,
    statuses,
    showConfirmComplete,
    setShowConfirmComplete,
    completingSprint,
    groupByEpic,
    setGroupByEpic,
    onlyMyIssues,
    setOnlyMyIssues,
    highPriorityOnly,
    setHighPriorityOnly,
    isTaskModalOpen,
    setIsTaskModalOpen,
    selectedTaskToEdit,
    setSelectedTaskToEdit,
    loadData,
    handleCompleteSprint,
    handleConfirmComplete,
    handleUpdateStatus,
    filteredTasks,
    tasksByEpic,
    remainingDays,
  };
};
