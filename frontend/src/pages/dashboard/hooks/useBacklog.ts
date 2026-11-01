import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
  fetchSprints,
  createSprint,
  updateSprint,
} from "../../../store/slices/sprintSlice";
import { fetchEpics, createEpic } from "../../../store/slices/epicSlice";
import { createTask, updateTask } from "../../../store/slices/taskSlice";
import { ITask } from "../../../types";
import { TOAST_MESSAGES } from "../../../constants/messages";

export const useBacklog = () => {
  const dispatch = useAppDispatch();
  const sprints = useAppSelector((state) => state.sprints.sprints);
  const backlogTasks = useAppSelector((state) => state.sprints.backlogTasks);
  const epics = useAppSelector((state) => state.epics.epics);
  const loading = useAppSelector(
    (state) => state.sprints.loading || state.epics.loading
  );

  const [selectedEpicFilter, setSelectedEpicFilter] = useState<string | null>(null);

  // Modals & Forms
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskToEdit, setSelectedTaskToEdit] = useState<ITask | null>(null);

  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");

  const [showStartSprint, setShowStartSprint] = useState<string | null>(null);
  const [startGoal, setStartGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showCreateEpic, setShowCreateEpic] = useState(false);
  const [newEpicName, setNewEpicName] = useState("");
  const [newEpicColor, setNewEpicColor] = useState("sky");
  const [newEpicDesc, setNewEpicDesc] = useState("");

  // Inline issue creator states per Sprint/Backlog
  const [activeInlineCreator, setActiveInlineCreator] = useState<string | null>(null);
  const [inlineTitle, setInlineTitle] = useState("");
  const [inlineIssueType, setInlineIssueType] = useState("Story");

  // Accordion open state: individual toggle per Sprint and Backlog
  // Sprints and backlog are closed by default for a clean, compact overview!
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Backwards-compatibility state
  const [expandedSprintId, setExpandedSprintId] = useState<string | null>(null);

  const [confirmCompleteSprintId, setConfirmCompleteSprintId] = useState<string | null>(null);
  const [confirmDeleteSprintId, setConfirmDeleteSprintId] = useState<string | null>(null);

  // Submitting/Loading States for Buttons
  const [creatingSprint, setCreatingSprint] = useState(false);
  const [startingSprint, setStartingSprint] = useState(false);
  const [completingSprint, setCompletingSprint] = useState(false);
  const [deletingSprint, setDeletingSprint] = useState(false);
  const [creatingEpic, setCreatingEpic] = useState(false);
  const [creatingInlineIssue, setCreatingInlineIssue] = useState<string | null>(null);

  const currentUserId = useMemo(() => {
    const cur = JSON.parse(localStorage.getItem("currentUser") || "{}");
    return cur.id || cur._id || "";
  }, []);

  const loadData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedEpicFilter) {
        params.append("epic", selectedEpicFilter);
      }
      await dispatch(fetchSprints(params.toString() ? params : undefined)).unwrap();
      await dispatch(fetchEpics()).unwrap();
    } catch (err: any) {
      console.error(err);
      toast.error(TOAST_MESSAGES.BACKLOG_LOAD_ERROR);
    }
  }, [dispatch, selectedEpicFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create Sprint
  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;
    setCreatingSprint(true);
    try {
      await dispatch(createSprint({ name: newSprintName.trim() })).unwrap();
      toast.success(TOAST_MESSAGES.SPRINT_CREATE_SUCCESS);
      setNewSprintName("");
      setShowCreateSprint(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || TOAST_MESSAGES.SPRINT_CREATE_ERROR);
    } finally {
      setCreatingSprint(false);
    }
  };

  // Start Sprint
  const handleStartSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStartSprint) return;
    setStartingSprint(true);
    try {
      await dispatch(
        updateSprint({
          id: showStartSprint,
          sprintData: {
            startDate,
            endDate,
            goal: startGoal,
            status: "active",
          },
        })
      ).unwrap();
      toast.success(TOAST_MESSAGES.SPRINT_START_SUCCESS);
      setShowStartSprint(null);
      setStartGoal("");
      setStartDate("");
      setEndDate("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || TOAST_MESSAGES.SPRINT_START_ERROR);
    } finally {
      setStartingSprint(false);
    }
  };

  // Complete Sprint
  const handleConfirmCompleteSprint = async () => {
    if (!confirmCompleteSprintId) return;
    setCompletingSprint(true);
    try {
      await dispatch(
        updateSprint({
          id: confirmCompleteSprintId,
          sprintData: { status: "completed" },
        })
      ).unwrap();
      toast.success(TOAST_MESSAGES.SPRINT_COMPLETE_SUCCESS);
      setConfirmCompleteSprintId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || TOAST_MESSAGES.SPRINT_COMPLETE_ERROR);
    } finally {
      setCompletingSprint(false);
    }
  };

  // Delete Sprint
  const handleConfirmDeleteSprint = async () => {
    if (!confirmDeleteSprintId) return;
    setDeletingSprint(true);
    try {
      await dispatch(
        updateSprint({
          id: confirmDeleteSprintId,
          sprintData: { status: "closed" },
        })
      ).unwrap();
      toast.success(TOAST_MESSAGES.SPRINT_DELETE_SUCCESS);
      setConfirmDeleteSprintId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || TOAST_MESSAGES.SPRINT_DELETE_ERROR);
    } finally {
      setDeletingSprint(false);
    }
  };

  // Create Epic
  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpicName.trim()) return;
    setCreatingEpic(true);
    try {
      await dispatch(
        createEpic({
          name: newEpicName.trim(),
          color: newEpicColor,
          description: newEpicDesc,
        })
      ).unwrap();
      toast.success(TOAST_MESSAGES.EPIC_CREATE_SUCCESS);
      setNewEpicName("");
      setNewEpicDesc("");
      setShowCreateEpic(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || TOAST_MESSAGES.EPIC_CREATE_ERROR);
    } finally {
      setCreatingEpic(false);
    }
  };

  // Move Task
  const handleMoveTask = async (taskId: string, targetSprintId: string | null) => {
    try {
      await dispatch(
        updateTask({ id: taskId, taskData: { sprint: targetSprintId } })
      ).unwrap();
      toast.success(
        targetSprintId
          ? TOAST_MESSAGES.TASK_MOVE_SPRINT
          : TOAST_MESSAGES.TASK_MOVE_BACKLOG
      );
      loadData();
    } catch (err: any) {
      toast.error(TOAST_MESSAGES.TASK_MOVE_ERROR);
    }
  };

  // Create Inline Issue
  const handleCreateInlineIssue = async (sprintId: string | null) => {
    if (!inlineTitle.trim()) return;
    const targetKey = sprintId || "backlog";
    setCreatingInlineIssue(targetKey);
    try {
      await dispatch(
        createTask({
          title: inlineTitle.trim(),
          sprint: sprintId,
          issueType: inlineIssueType,
          owner: currentUserId,
          priority: "Medium",
        })
      ).unwrap();
      toast.success(TOAST_MESSAGES.ISSUE_CREATE_SUCCESS);
      setInlineTitle("");
      setActiveInlineCreator(null);
      // Auto-expand this sprint/backlog so the newly created issue is immediately visible
      setOpenSections((prev) => ({ ...prev, [targetKey]: true }));
      loadData();
    } catch (err: any) {
      toast.error(err.message || TOAST_MESSAGES.ISSUE_CREATE_ERROR);
    } finally {
      setCreatingInlineIssue(null);
    }
  };

  // Epic filter is managed directly by the backend query in loadData
  const filterByEpic = useCallback((tasks: ITask[]) => {
    return tasks;
  }, []);

  return {
    sprints,
    backlogTasks,
    epics,
    loading,
    selectedEpicFilter,
    setSelectedEpicFilter,
    openSections,
    setOpenSections,
    toggleSection,
    isTaskModalOpen,
    setIsTaskModalOpen,
    selectedTaskToEdit,
    setSelectedTaskToEdit,
    showCreateSprint,
    setShowCreateSprint,
    newSprintName,
    setNewSprintName,
    showStartSprint,
    setShowStartSprint,
    startGoal,
    setStartGoal,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    showCreateEpic,
    setShowCreateEpic,
    newEpicName,
    setNewEpicName,
    newEpicColor,
    setNewEpicColor,
    newEpicDesc,
    setNewEpicDesc,
    activeInlineCreator,
    setActiveInlineCreator,
    inlineTitle,
    setInlineTitle,
    inlineIssueType,
    setInlineIssueType,
    expandedSprintId,
    setExpandedSprintId,
    confirmCompleteSprintId,
    setConfirmCompleteSprintId,
    confirmDeleteSprintId,
    setConfirmDeleteSprintId,
    creatingSprint,
    startingSprint,
    completingSprint,
    deletingSprint,
    creatingEpic,
    creatingInlineIssue,
    loadData,
    handleCreateSprint,
    handleStartSprint,
    handleConfirmCompleteSprint,
    handleConfirmDeleteSprint,
    handleCreateEpic,
    handleMoveTask,
    handleCreateInlineIssue,
    filterByEpic,
  };
};
