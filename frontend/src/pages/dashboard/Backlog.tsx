import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { 
  Plus, 
  Calendar, 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  CheckCircle,
  User,
  X,
  ChevronUp,
  FileText,
  AlertCircle,
  FolderPlus,
  CheckSquare,
  Archive
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchSprints, createSprint, updateSprint, deleteSprint } from "../../store/slices/sprintSlice";
import { fetchEpics, createEpic } from "../../store/slices/epicSlice";
import { createTask, updateTask } from "../../store/slices/taskSlice";
import TaskModal from "../../components/TaskModal";
import { Button } from "../../components/ui/Button";
import { ITask } from "../../types";

const EPIC_COLORS: Record<string, string> = {
  sky: "bg-sky-100 text-sky-850 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-850",
  emerald: "bg-emerald-100 text-emerald-850 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-850",
  violet: "bg-violet-100 text-violet-850 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-850",
  amber: "bg-amber-100 text-amber-850 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-850",
  rose: "bg-rose-100 text-rose-850 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-850",
  indigo: "bg-indigo-100 text-indigo-850 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-850",
};

const getPriorityStyle = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-red-605 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30";
    case "medium":
      return "text-amber-605 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30";
    default:
      return "text-green-605 bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30";
  }
};

export const Backlog: React.FC = () => {
  const dispatch = useAppDispatch();
  const sprints = useAppSelector((state) => state.sprints.sprints);
  const backlogTasks = useAppSelector((state) => state.sprints.backlogTasks);
  const epics = useAppSelector((state) => state.epics.epics);
  const loading = useAppSelector((state) => state.sprints.loading || state.epics.loading);

  const [selectedEpicFilter, setSelectedEpicFilter] = useState<string | null>(null);

  // Modals & Forms
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskToEdit, setSelectedTaskToEdit] = useState<ITask | null>(null);

  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState("");

  const [showStartSprint, setShowStartSprint] = useState<string | null>(null); // Sprint ID
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

  // Accordion expanded state for Sprints (only one expanded at a time)
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
      await dispatch(fetchSprints()).unwrap();
      await dispatch(fetchEpics()).unwrap();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load backlog board details.");
    }
  }, [dispatch]);

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
      toast.success("Sprint created successfully!");
      setNewSprintName("");
      setShowCreateSprint(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create sprint.");
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
      await dispatch(updateSprint({
        id: showStartSprint,
        sprintData: {
          startDate,
          endDate,
          goal: startGoal,
          status: "active",
        }
      })).unwrap();
      toast.success("Sprint started! Active Scrum Board is live.");
      setShowStartSprint(null);
      setStartGoal("");
      setStartDate("");
      setEndDate("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to start sprint.");
    } finally {
      setStartingSprint(false);
    }
  };

  // Complete Sprint
  const handleCompleteSprint = (sprintId: string) => {
    setConfirmCompleteSprintId(sprintId);
  };

  const handleConfirmCompleteSprint = async () => {
    if (!confirmCompleteSprintId) return;
    setCompletingSprint(true);
    try {
      await dispatch(updateSprint({ id: confirmCompleteSprintId, sprintData: { status: "completed" } })).unwrap();
      toast.success("Sprint completed successfully!");
      setConfirmCompleteSprintId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to complete sprint.");
    } finally {
      setCompletingSprint(false);
    }
  };

  // Delete Sprint
  const handleDeleteSprint = (sprintId: string) => {
    setConfirmDeleteSprintId(sprintId);
  };

  const handleConfirmDeleteSprint = async () => {
    if (!confirmDeleteSprintId) return;
    setDeletingSprint(true);
    try {
      await dispatch(updateSprint({ id: confirmDeleteSprintId, sprintData: { status: "closed" } })).unwrap();
      toast.success("Sprint closed.");
      setConfirmDeleteSprintId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to close sprint.");
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
      await dispatch(createEpic({
        name: newEpicName.trim(),
        color: newEpicColor,
        description: newEpicDesc,
      })).unwrap();
      toast.success("Epic created successfully!");
      setNewEpicName("");
      setNewEpicDesc("");
      setShowCreateEpic(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create epic.");
    } finally {
      setCreatingEpic(false);
    }
  };

  // Move Task between Sprints or Backlog
  const handleMoveTask = async (taskId: string, targetSprintId: string | null) => {
    try {
      await dispatch(updateTask({ id: taskId, taskData: { sprint: targetSprintId } })).unwrap();
      toast.success(targetSprintId ? "Task added to Sprint." : "Task moved to Backlog.");
      loadData();
    } catch (err: any) {
      toast.error("Failed to reassign task destination.");
    }
  };

  // Inline Issue Creator Submission
  const handleCreateInlineIssue = async (sprintId: string | null) => {
    if (!inlineTitle.trim()) return;
    const targetKey = sprintId || "backlog";
    setCreatingInlineIssue(targetKey);
    try {
      await dispatch(createTask({
        title: inlineTitle.trim(),
        sprint: sprintId,
        issueType: inlineIssueType,
        owner: currentUserId,
        priority: "Medium"
      })).unwrap();
      toast.success("Issue created!");
      setInlineTitle("");
      setActiveInlineCreator(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create issue.");
    } finally {
      setCreatingInlineIssue(null);
    }
  };

  const toggleSprintAccordion = (sprintId: string) => {
    setExpandedSprintId(prev => prev === sprintId ? null : sprintId);
  };

  // Filter Tasks by Epic if selected
  const filterByEpic = (tasks: ITask[]) => {
    if (!selectedEpicFilter) return tasks;
    return tasks.filter(t => {
      const epicId = typeof t.epic === "object" && t.epic ? (t.epic as any)._id : t.epic;
      return epicId === selectedEpicFilter;
    });
  };

  // Calculate story points sums
  const calculateSprintMetrics = (tasks: ITask[]) => {
    let todo = 0, progress = 0, done = 0;
    tasks.forEach(t => {
      const sp = t.storyPoints || 0;
      if (t.status === "Done" || t.status === "Closed") {
        done += sp;
      } else if (t.status === "In Progress" || t.status === "QA Ready" || t.status === "CR Ready") {
        progress += sp;
      } else {
        todo += sp;
      }
    });
    return { todo, progress, done };
  };

  // RENDER PLANMATE-STYLE HYBRID CARD ROW
  const renderJiraTaskRow = (task: ITask, currentSprintId: string | null) => {
    const isCompleted = task.status === "Done" || task.completed === "Yes" || task.completed === true;

    return (
      <div 
        key={task._id} 
        draggable
        onDragStart={(e) => e.dataTransfer.setData("text/plain", task._id)}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("button") || target.closest("select")) return;
          setSelectedTaskToEdit(task);
          setIsTaskModalOpen(true);
        }}
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-2.5 bg-white dark:bg-gray-900 hover:bg-sky-5/30 dark:hover:bg-gray-800/35 rounded-xl border border-sky-100/70 dark:border-gray-800 shadow-xs transition-all duration-200 cursor-pointer gap-3 border-l-4 ${
          task.priority === "High" ? "border-l-red-500" :
          task.priority === "Medium" ? "border-l-amber-500" :
          "border-l-green-500"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Drag Handle */}
          <div className="text-gray-300 dark:text-gray-650 cursor-grab active:cursor-grabbing shrink-0 flex flex-col gap-0.5">
            <span className="w-1.5 h-0.5 bg-current rounded-full" />
            <span className="w-1.5 h-0.5 bg-current rounded-full" />
            <span className="w-1.5 h-0.5 bg-current rounded-full" />
          </div>

          <CheckSquare className="w-4 h-4 text-sky-500 fill-sky-50 dark:fill-sky-950/20 shrink-0" />

          {/* Issue Key */}
          <span className="text-xs font-bold text-gray-400 select-all shrink-0">
            {task.key || `PM-${task._id ? task._id.slice(-4).toUpperCase() : "TASK"}`}
          </span>

          {/* Issue Title Link */}
          <h3 className={`text-sm font-semibold truncate ${
            isCompleted ? "text-gray-400 line-through" : "text-gray-700 dark:text-gray-200"
          }`}>
            {task.title}
          </h3>

          {/* Epic Badge */}
          {task.epic && typeof task.epic === "object" && (
            <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
              EPIC_COLORS[(task.epic as any).color] || EPIC_COLORS.sky
            }`}>
              {(task.epic as any).name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3.5 text-xs shrink-0 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
          {/* Status Badge */}
          {task.status && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              isCompleted ? "text-green-700 bg-green-50 dark:bg-green-950/20 border-green-100" :
              task.status === "In Progress" ? "text-amber-700 bg-amber-50 dark:bg-amber-950/20 border-amber-100" :
              "text-sky-700 bg-sky-55/20 dark:bg-sky-950/20 border-sky-100"
            }`}>
              {task.status}
            </span>
          )}

          {/* Story Points Circle */}
          {task.storyPoints !== undefined && (
            <span className="w-5 h-5 rounded-full bg-gray-150 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center text-[9px] font-black shrink-0">
              {task.storyPoints}
            </span>
          )}

          {/* Assignee Avatar */}
          {task.assignee ? (
            <div 
              className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 flex items-center justify-center font-extrabold text-[9px] border border-sky-200 dark:border-gray-800 uppercase shrink-0" 
              title={`Assigned to: ${typeof task.assignee === 'object' ? (task.assignee as any).name : 'Team Member'}`}
            >
              {typeof task.assignee === 'object' && (task.assignee as any).name
                ? (task.assignee as any).name.split(/\s+/).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                : "U"}
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-[8px] text-gray-400 shrink-0">
              <User className="w-2.5 h-2.5" />
            </div>
          )}

          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
            {task.priority || "Low"}
          </span>

          {/* Action Destination Selector */}
          <select
            onChange={(e) => {
              const val = e.target.value;
              handleMoveTask(task._id, val === "backlog" ? null : val);
            }}
            value={currentSprintId || "backlog"}
            className="px-2 py-1 rounded text-xs font-bold border border-sky-100 dark:border-gray-800 cursor-pointer focus:outline-none bg-white dark:bg-gray-900 text-gray-500"
          >
            <option value={currentSprintId || "backlog"}>Move</option>
            {currentSprintId !== "backlog" && <option value="backlog">Backlog</option>}
            {sprints.filter(s => s._id !== currentSprintId).map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  if (loading && sprints.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Backlog Planning</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Plan sprints, organize epics, and triage the project backlog.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateSprint(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Create Sprint
          </Button>
        </div>
      </div>

      {/* Epic Filter Tabs Row */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-3 border-b border-sky-100/50 dark:border-gray-800">
        <span className="text-xs font-bold text-gray-400 flex items-center gap-1 mr-1 shrink-0">
          <Layers className="w-3.5 h-3.5" /> Epics:
        </span>
        <Button
          variant={!selectedEpicFilter ? "primary" : "outline"}
          size="sm"
          onClick={() => setSelectedEpicFilter(null)}
        >
          All Epics
        </Button>
        {epics.map((epic) => (
          <Button
            key={epic._id}
            variant={selectedEpicFilter === epic._id ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedEpicFilter(epic._id)}
            icon={
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                epic.color === "emerald" ? "bg-emerald-500" :
                epic.color === "violet" ? "bg-violet-500" :
                epic.color === "amber" ? "bg-amber-500" :
                epic.color === "rose" ? "bg-rose-500" :
                epic.color === "indigo" ? "bg-indigo-500" : "bg-sky-500"
              }`} />
            }
          >
            {epic.name}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateEpic(true)}
          icon={<FolderPlus className="w-3.5 h-3.5 text-sky-600" />}
          className="ml-auto"
        >
          New Epic
        </Button>
      </div>

      <div className="w-full space-y-6">
        {/* RIGHT MAIN AREA: Sprints & Backlog lists */}
        <div className="w-full space-y-6">
          {/* Planned / Active Sprints */}
          {sprints.map((sprint) => {
            const isCollapsed = expandedSprintId !== sprint._id;
            const filteredTasks = filterByEpic(sprint.tasks || []);
            const { todo, progress, done } = calculateSprintMetrics(filteredTasks);

            return (
              <div 
                key={sprint._id} 
                className={`bg-white dark:bg-gray-900 border rounded-2xl shadow-sm overflow-hidden transition-all ${
                  isCollapsed ? "p-3 sm:p-3.5" : "p-4 sm:p-5 space-y-4"
                } ${
                  sprint.status === "active" 
                    ? "border-sky-300 ring-2 ring-sky-500/10 dark:border-sky-850" 
                    : "border-sky-100/70 dark:border-gray-850"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const taskId = e.dataTransfer.getData("text/plain");
                  if (taskId) handleMoveTask(taskId, sprint._id);
                }}
              >
                {/* Sprint Header Panel */}
                <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
                  isCollapsed ? "" : "pb-3 border-b border-sky-50 dark:border-gray-850"
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <button 
                      onClick={() => toggleSprintAccordion(sprint._id)}
                      className="p-1 hover:bg-sky-100/50 dark:hover:bg-gray-850 rounded text-gray-500 cursor-pointer"
                    >
                      {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-gray-800 dark:text-gray-150 text-sm truncate">{sprint.name}</h3>
                        {sprint.status === "active" ? (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-sky-600 text-white px-2 py-0.5 rounded shadow-sm">
                            Active
                          </span>
                        ) : sprint.status === "completed" ? (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-gray-200 text-gray-650 px-2 py-0.5 rounded dark:bg-gray-800 dark:text-gray-400">
                            Completed
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-705 border border-amber-100 px-2 py-0.5 rounded dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50">
                            Planned
                          </span>
                        )}
                      </div>
                      {sprint.goal && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">Goal: {sprint.goal}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    {/* Story Points Circle Badges (Jira Style) */}
                    <div className="flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[9px] font-black" title="To Do Story Points">
                        {todo}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px] font-black" title="In Progress Story Points">
                        {progress}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-black" title="Done Story Points">
                        {done}
                      </span>
                    </div>

                    <span className="text-[10px] text-gray-400 font-bold border dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-0.5 rounded-lg">
                      {filteredTasks.length} Issues
                    </span>

                    {sprint.status !== "active" ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowStartSprint(sprint._id)}
                      >
                        Start Sprint
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCompleteSprint(sprint._id)}
                      >
                        Complete Sprint
                      </Button>
                    )}

                    {/* Close button */}
                    <button 
                      onClick={() => handleDeleteSprint(sprint._id)}
                      className="p-1 hover:bg-amber-50 text-amber-605 dark:hover:bg-amber-950/20 rounded cursor-pointer"
                      title="Close Sprint"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* SPRINT ISSUES CONTAINER LIST (PLANMATE CARDS STYLE) */}
                {!isCollapsed && (
                  <div className="space-y-2.5">
                    {filteredTasks.map((task) => renderJiraTaskRow(task, sprint._id))}

                    {filteredTasks.length === 0 && (
                      <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                        <p className="text-xs">Drag issues here or use inline creator below to plan tasks.</p>
                      </div>
                    )}

                    {/* INLINE ISSUES CREATOR CARD */}
                    {activeInlineCreator === sprint._id ? (
                      <div className="bg-white dark:bg-gray-950 p-3 rounded-xl border border-dashed border-sky-200 dark:border-gray-800 flex items-center gap-2">
                        <select
                          value={inlineIssueType}
                          onChange={(e) => setInlineIssueType(e.target.value)}
                          className="text-xs border border-sky-100 dark:border-gray-800 rounded bg-white dark:bg-gray-900 px-2 py-1 outline-none text-gray-700 dark:text-gray-300 font-bold shrink-0"
                        >
                          <option value="Story">Story</option>
                          <option value="Task">Task</option>
                          <option value="Bug">Bug</option>
                        </select>
                        <input
                          type="text"
                          value={inlineTitle}
                          onChange={(e) => setInlineTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCreateInlineIssue(sprint._id);
                          }}
                          placeholder="What needs to be done? Press Enter to save."
                          className="flex-1 bg-transparent text-xs font-semibold px-2 py-1 outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
                          autoFocus
                        />
                        <Button 
                          variant="primary"
                          size="sm"
                          onClick={() => handleCreateInlineIssue(sprint._id)}
                          loading={creatingInlineIssue === sprint._id}
                        >
                          Save
                        </Button>
                        <button 
                          onClick={() => {
                            setActiveInlineCreator(null);
                            setInlineTitle("");
                          }}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveInlineCreator(sprint._id);
                          setInlineIssueType("Story");
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-sky-50/20 text-gray-400 dark:text-gray-500 hover:text-sky-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-dashed border-sky-100/70 dark:border-gray-800 rounded-xl"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create Issue
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* BACKLOG ISSUES CONTAINER */}
          <div 
            className={`bg-white dark:bg-gray-900 border border-sky-100/70 dark:border-gray-850 rounded-2xl shadow-sm overflow-hidden transition-all ${
              expandedSprintId !== "backlog" ? "p-3 sm:p-3.5" : "p-4 sm:p-5 space-y-4"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const taskId = e.dataTransfer.getData("text/plain");
              if (taskId) handleMoveTask(taskId, null);
            }}
          >
            {/* Backlog Header */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
              expandedSprintId !== "backlog" ? "" : "pb-3 border-b border-sky-50 dark:border-gray-850"
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <button 
                  onClick={() => setExpandedSprintId(expandedSprintId === "backlog" ? null : "backlog")}
                  className="p-1 hover:bg-sky-100/50 dark:hover:bg-gray-850 rounded text-gray-500 cursor-pointer"
                >
                  {expandedSprintId !== "backlog" ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-gray-800 dark:text-gray-150 text-sm">Backlog Issues</h3>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-bold border dark:border-gray-800 bg-white dark:bg-gray-950 px-2 py-0.5 rounded-lg">
                {filterByEpic(backlogTasks).length} Issues • <strong className="text-sky-600">
                  {filterByEpic(backlogTasks).reduce((sum, t) => sum + (t.storyPoints || 0), 0)} SP
                </strong>
              </span>
            </div>

            {/* Backlog Task Rows (PLANMATE CARDS STYLE) */}
            {expandedSprintId === "backlog" && (
              <div className="space-y-2.5">
                {filterByEpic(backlogTasks).map((task) => renderJiraTaskRow(task, null))}

                {backlogTasks.length === 0 && (
                  <div className="text-center py-6 text-gray-400 dark:text-gray-500">
                    <p className="text-xs">No tasks inside backlog. Use inline creator below to add.</p>
                  </div>
                )}

                {/* BACKLOG INLINE ISSUE CREATOR */}
                {activeInlineCreator === "backlog" ? (
                  <div className="bg-white dark:bg-gray-950 p-3 rounded-xl border border-dashed border-sky-200 dark:border-gray-800 flex items-center gap-2 animate-fadeIn">
                    <select
                      value={inlineIssueType}
                      onChange={(e) => setInlineIssueType(e.target.value)}
                      className="text-xs border border-sky-100 dark:border-gray-800 rounded bg-white dark:bg-gray-900 px-2 py-1 outline-none text-gray-700 dark:text-gray-300 font-bold shrink-0"
                    >
                      <option value="Story">Story</option>
                      <option value="Task">Task</option>
                      <option value="Bug">Bug</option>
                    </select>
                    <input
                      type="text"
                      value={inlineTitle}
                      onChange={(e) => setInlineTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateInlineIssue(null);
                      }}
                      placeholder="What needs to be done? Press Enter to save."
                      className="flex-1 bg-transparent text-xs font-semibold px-2 py-1 outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
                      autoFocus
                    />
                    <Button 
                      variant="primary"
                      size="sm"
                      onClick={() => handleCreateInlineIssue(null)}
                      loading={creatingInlineIssue === "backlog"}
                    >
                      Save
                    </Button>
                    <button 
                      onClick={() => {
                        setActiveInlineCreator(null);
                        setInlineTitle("");
                      }}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveInlineCreator("backlog");
                      setInlineIssueType("Story");
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-sky-50/20 text-gray-400 dark:text-gray-500 hover:text-sky-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-dashed border-sky-100/70 dark:border-gray-800 rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Issue
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Edit Modal */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTaskToEdit(null);
          }}
          taskToEdit={selectedTaskToEdit}
          onSave={() => loadData()}
        />
      )}

      {/* Create Sprint Modal */}
      {showCreateSprint && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/35 z-55 flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateSprint}
            className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn space-y-4"
          >
            <div className="flex justify-between items-center border-b border-sky-50 pb-2">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">New planned Sprint</h3>
              <button 
                type="button" 
                onClick={() => setShowCreateSprint(false)}
                className="text-gray-400 hover:text-sky-655 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Sprint Name</label>
              <input
                type="text"
                placeholder="e.g. Sprint 2"
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowCreateSprint(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={creatingSprint}
              >
                Create Sprint
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Start Sprint Modal */}
      {showStartSprint && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/35 z-55 flex items-center justify-center p-4">
          <form 
            onSubmit={handleStartSprint}
            className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn space-y-4"
          >
            <div className="flex justify-between items-center border-b border-sky-50 pb-2">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Start Sprint</h3>
              <button 
                type="button" 
                onClick={() => setShowStartSprint(null)}
                className="text-gray-400 hover:text-sky-600 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Sprint Goal</label>
                <textarea
                  placeholder="What is this sprint's objective?"
                  value={startGoal}
                  onChange={(e) => setStartGoal(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowStartSprint(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={startingSprint}
              >
                Start
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Create Epic Modal */}
      {showCreateEpic && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/35 z-55 flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateEpic}
            className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn space-y-4"
          >
            <div className="flex justify-between items-center border-b border-sky-50 pb-2">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">Create Epic</h3>
              <button 
                type="button" 
                onClick={() => setShowCreateEpic(false)}
                className="text-gray-400 hover:text-sky-600 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Epic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mobile App Support"
                  value={newEpicName}
                  onChange={(e) => setNewEpicName(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Theme Color</label>
                <select
                  value={newEpicColor}
                  onChange={(e) => setNewEpicColor(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                >
                  <option value="sky">Sky Blue</option>
                  <option value="emerald">Emerald Green</option>
                  <option value="violet">Violet Purple</option>
                  <option value="amber">Amber Yellow</option>
                  <option value="rose">Rose Red</option>
                  <option value="indigo">Indigo Blue</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Description</label>
                <textarea
                  placeholder="Summary of epic's goal..."
                  value={newEpicDesc}
                  onChange={(e) => setNewEpicDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowCreateEpic(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={creatingEpic}
              >
                Create Epic
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Complete Modal */}
      {confirmCompleteSprintId && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/35 z-55 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn space-y-4">
            <div className="flex justify-between items-center border-b border-sky-50 dark:border-gray-850 pb-2">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Complete Sprint</h3>
              <button 
                type="button" 
                onClick={() => setConfirmCompleteSprintId(null)}
                className="text-gray-400 hover:text-sky-655 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Are you sure you want to complete this Sprint? All incomplete tasks will return to the backlog.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setConfirmCompleteSprintId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCompleteSprint}
                loading={completingSprint}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete/Close Modal */}
      {confirmDeleteSprintId && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/35 z-55 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn space-y-4">
            <div className="flex justify-between items-center border-b border-sky-50 dark:border-gray-850 pb-2">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base">Close Sprint</h3>
              <button 
                type="button" 
                onClick={() => setConfirmDeleteSprintId(null)}
                className="text-gray-400 hover:text-sky-655 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Are you sure you want to close this Sprint? All incomplete tasks will return to the backlog.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setConfirmDeleteSprintId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDeleteSprint}
                loading={deletingSprint}
              >
                Close Sprint
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backlog;
