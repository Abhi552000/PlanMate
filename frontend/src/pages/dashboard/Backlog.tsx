import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { 
  Plus, 
  Calendar, 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  Edit3, 
  Play, 
  CheckCircle,
  HelpCircle,
  Clock,
  Flag,
  User,
  ArrowRight,
  X
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchSprints, createSprint, updateSprint, deleteSprint } from "../../store/slices/sprintSlice";
import { fetchEpics, createEpic } from "../../store/slices/epicSlice";
import { updateTask } from "../../store/slices/taskSlice";
import TaskModal from "../../components/TaskModal";
import { ITask } from "../../types";

const EPIC_COLORS: Record<string, string> = {
  sky: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-850",
  emerald: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-850",
  violet: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-850",
  amber: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-850",
  rose: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-850",
  indigo: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-850",
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

  // Accordion collapsed state for Sprints
  const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});

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
    try {
      await dispatch(createSprint({ name: newSprintName.trim() })).unwrap();
      toast.success("Sprint created successfully!");
      setNewSprintName("");
      setShowCreateSprint(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create sprint.");
    }
  };

  // Start Sprint
  const handleStartSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStartSprint) return;
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
    }
  };

  // Complete Sprint
  const handleCompleteSprint = async (sprintId: string) => {
    if (!window.confirm("Are you sure you want to complete this Sprint? All uncompleted tasks will return to the backlog.")) return;
    try {
      await dispatch(updateSprint({ id: sprintId, sprintData: { status: "completed" } })).unwrap();
      toast.success("Sprint completed successfully!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to complete sprint.");
    }
  };

  // Delete Sprint
  const handleDeleteSprint = async (sprintId: string) => {
    if (!window.confirm("Are you sure you want to delete this Sprint? Tasks will be sent to the Backlog.")) return;
    try {
      await dispatch(deleteSprint(sprintId)).unwrap();
      toast.success("Sprint deleted.");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete sprint.");
    }
  };

  // Create Epic
  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpicName.trim()) return;
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

  const toggleSprintAccordion = (sprintId: string) => {
    setCollapsedSprints(prev => ({
      ...prev,
      [sprintId]: !prev[sprintId],
    }));
  };

  // Filter Tasks by Epic if selected
  const filterByEpic = (tasks: ITask[]) => {
    if (!selectedEpicFilter) return tasks;
    return tasks.filter(t => {
      const epicId = typeof t.epic === "object" && t.epic ? (t.epic as any)._id : t.epic;
      return epicId === selectedEpicFilter;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Backlog Planning</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Plan sprints, organize epics, and triage the project backlog.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateSprint(true)}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-xl text-sm shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Sprint
          </button>
          <button
            onClick={() => setShowCreateEpic(true)}
            className="flex items-center gap-1.5 border border-sky-100 hover:bg-sky-50 text-sky-700 dark:border-gray-800 dark:text-sky-400 dark:hover:bg-gray-900 font-bold py-2 px-4 rounded-xl text-sm transition-all cursor-pointer bg-white dark:bg-gray-950"
          >
            <Layers className="w-4 h-4" /> Create Epic
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Epic Filters Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Epics</h2>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setSelectedEpicFilter(null)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !selectedEpicFilter 
                    ? "bg-sky-500 text-white" 
                    : "hover:bg-sky-50 dark:hover:bg-gray-850 text-gray-700 dark:text-gray-300"
                }`}
              >
                All Epics
              </button>
              {epics.map((epic) => (
                <button
                  key={epic._id}
                  onClick={() => setSelectedEpicFilter(epic._id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedEpicFilter === epic._id
                      ? "bg-sky-500 text-white border-sky-600"
                      : "bg-gray-50/50 hover:bg-sky-50/30 border-sky-100/50 text-gray-700 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-850"
                  }`}
                >
                  <span className="truncate">{epic.name}</span>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    epic.color === "emerald" ? "bg-emerald-500" :
                    epic.color === "violet" ? "bg-violet-500" :
                    epic.color === "amber" ? "bg-amber-500" :
                    epic.color === "rose" ? "bg-rose-500" :
                    epic.color === "indigo" ? "bg-indigo-500" : "bg-sky-500"
                  }`} />
                </button>
              ))}
              {epics.length === 0 && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center py-4">No Epics created yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Sprints & Backlog list */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active / Planned Sprints List */}
          {sprints.map((sprint) => {
            const isCollapsed = collapsedSprints[sprint._id] || false;
            const filteredTasks = filterByEpic(sprint.tasks || []);
            const totalPoints = filteredTasks.reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0);

            return (
              <div 
                key={sprint._id} 
                className={`bg-white dark:bg-gray-900 border rounded-2xl shadow-sm transition-all overflow-hidden ${
                  sprint.status === "active" 
                    ? "border-sky-300 ring-2 ring-sky-500/10 dark:border-sky-850" 
                    : "border-sky-100/70 dark:border-gray-800"
                }`}
              >
                {/* Sprint Header */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-50 dark:border-gray-850 bg-sky-50/10 dark:bg-sky-950/5">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleSprintAccordion(sprint._id)}
                      className="text-gray-400 hover:text-sky-600 transition-colors p-1 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                    >
                      {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-gray-800 dark:text-gray-150 text-base">{sprint.name}</h3>
                        {sprint.status === "active" ? (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-sky-550 text-white px-2 py-0.5 rounded shadow-sm">
                            Active
                          </span>
                        ) : sprint.status === "completed" ? (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-gray-200 text-gray-600 px-2 py-0.5 rounded dark:bg-gray-800 dark:text-gray-400">
                            Completed
                          </span>
                        ) : (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50">
                            Planned
                          </span>
                        )}
                      </div>
                      {sprint.goal && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 italic">Goal: {sprint.goal}</p>
                      )}
                      {sprint.startDate && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-sky-400" />
                          {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:self-center">
                    <span className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-850 px-2.5 py-1 rounded-lg border border-sky-100/20">
                      {filteredTasks.length} Issues • <strong className="text-sky-600">{totalPoints} SP</strong>
                    </span>
                    {sprint.status === "planned" && (
                      <button
                        onClick={() => setShowStartSprint(sprint._id)}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" /> Start Sprint
                      </button>
                    )}
                    {sprint.status === "active" && (
                      <button
                        onClick={() => handleCompleteSprint(sprint._id)}
                        className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Complete Sprint
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteSprint(sprint._id)}
                      className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                      title="Delete Sprint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sprint Issue Cards */}
                {!isCollapsed && (
                  <div className="p-2 space-y-1.5 bg-gray-50/30 dark:bg-gray-950/10">
                    {filteredTasks.map((task: ITask) => (
                      <div 
                        key={task._id} 
                        className="bg-white dark:bg-gray-900 border border-sky-100/50 dark:border-gray-800 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs hover:border-sky-300 dark:hover:border-sky-850 hover:shadow-xs transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Issue Type Indicator */}
                          <span className={`text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                            task.issueType === "Bug" ? "bg-red-50 text-red-700 border-red-100" :
                            task.issueType === "Story" ? "bg-green-50 text-green-700 border-green-100" :
                            task.issueType === "Epic" ? "bg-purple-50 text-purple-700 border-purple-100" :
                            "bg-sky-50 text-sky-700 border-sky-100"
                          }`}>
                            {task.issueType}
                          </span>

                          <button 
                            onClick={() => {
                              setSelectedTaskToEdit(task);
                              setIsTaskModalOpen(true);
                            }}
                            className="text-sm font-bold text-gray-800 dark:text-gray-200 hover:text-sky-600 text-left truncate cursor-pointer hover:underline"
                          >
                            {task.title}
                          </button>

                          {/* Epic Badge */}
                          {task.epic && typeof task.epic === "object" && (
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${
                              EPIC_COLORS[(task.epic as any).color] || EPIC_COLORS.sky
                            }`}>
                              {(task.epic as any).name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Story Points */}
                          {task.storyPoints !== undefined && (
                            <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-extrabold text-gray-500 dark:text-gray-400">
                              {task.storyPoints}
                            </span>
                          )}

                          {/* Assignee Avatar */}
                          {task.assignee ? (
                            <div 
                              className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center text-[9px] font-black text-sky-700 dark:text-sky-400 border border-sky-200"
                              title={typeof task.assignee === "object" ? (task.assignee as any).name : "Assigned"}
                            >
                              {typeof task.assignee === "object" 
                                ? (task.assignee as any).name?.[0]?.toUpperCase() 
                                : "A"}
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-[9px] text-gray-400">
                              <User className="w-3 h-3" />
                            </div>
                          )}

                          {/* Action Selector */}
                          <select
                            onChange={(e) => {
                              const val = e.target.value;
                              handleMoveTask(task._id, val === "backlog" ? null : val);
                            }}
                            value={sprint._id}
                            className="text-[10px] font-bold border border-sky-100/50 dark:border-gray-800 rounded bg-white dark:bg-gray-900 px-1 py-0.5 outline-none cursor-pointer"
                          >
                            <option value={sprint._id}>Stay Here</option>
                            <option value="backlog">Move to Backlog</option>
                            {sprints.filter(s => s._id !== sprint._id).map(s => (
                              <option key={s._id} value={s._id}>Move to {s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}

                    {filteredTasks.length === 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">Drag issues here or use selectors to plan this sprint.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* BACKLOG PANEL */}
          <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-50 dark:border-gray-850 bg-sky-50/10">
              <div>
                <h3 className="font-extrabold text-gray-800 dark:text-gray-150 text-base">Backlog Issues</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Issues that are currently not assigned to any sprint.</p>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-850 px-2.5 py-1 rounded-lg border border-sky-100/20">
                  {filterByEpic(backlogTasks).length} Issues • <strong className="text-sky-600">
                    {filterByEpic(backlogTasks).reduce((sum, t) => sum + (t.storyPoints || 0), 0)} SP
                  </strong>
                </span>
              </div>
            </div>

            <div className="p-3 space-y-1.5 bg-gray-50/30">
              {filterByEpic(backlogTasks).map((task) => (
                <div 
                  key={task._id} 
                  className="bg-white dark:bg-gray-900 border border-sky-100/50 dark:border-gray-800 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs hover:border-sky-300 dark:hover:border-sky-850 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                      task.issueType === "Bug" ? "bg-red-50 text-red-700 border-red-100" :
                      task.issueType === "Story" ? "bg-green-50 text-green-700 border-green-100" :
                      task.issueType === "Epic" ? "bg-purple-50 text-purple-700 border-purple-100" :
                      "bg-sky-50 text-sky-700 border-sky-100"
                    }`}>
                      {task.issueType}
                    </span>

                    <button 
                      onClick={() => {
                        setSelectedTaskToEdit(task);
                        setIsTaskModalOpen(true);
                      }}
                      className="text-sm font-bold text-gray-800 dark:text-gray-200 hover:text-sky-600 text-left truncate cursor-pointer hover:underline"
                    >
                      {task.title}
                    </button>

                    {task.epic && typeof task.epic === "object" && (
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${
                        EPIC_COLORS[(task.epic as any).color] || EPIC_COLORS.sky
                      }`}>
                        {(task.epic as any).name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {task.storyPoints !== undefined && (
                      <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-extrabold text-gray-500 dark:text-gray-400">
                        {task.storyPoints}
                      </span>
                    )}

                    {task.assignee ? (
                      <div 
                        className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center text-[9px] font-black text-sky-700 dark:text-sky-400 border border-sky-200"
                        title={typeof task.assignee === "object" ? (task.assignee as any).name : "Assigned"}
                      >
                        {typeof task.assignee === "object" 
                          ? (task.assignee as any).name?.[0]?.toUpperCase() 
                          : "A"}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-[9px] text-gray-400">
                        <User className="w-3 h-3" />
                      </div>
                    )}

                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "backlog") {
                          handleMoveTask(task._id, val);
                        }
                      }}
                      value="backlog"
                      className="text-[10px] font-bold border border-sky-100/50 dark:border-gray-800 rounded bg-white dark:bg-gray-900 px-1 py-0.5 outline-none cursor-pointer"
                    >
                      <option value="backlog">Stay In Backlog</option>
                      {sprints.map(s => (
                        <option key={s._id} value={s._id}>Move to {s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              {backlogTasks.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-12">All tasks are planned inside sprints. Clear backlog!</p>
              )}

              <button
                onClick={() => {
                  setSelectedTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="w-full py-2.5 border border-dashed border-sky-100 dark:border-gray-800 hover:border-sky-300 text-gray-400 hover:text-sky-655 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:bg-white dark:hover:bg-gray-900"
              >
                <Plus className="w-4 h-4" /> Create Issue
              </button>
            </div>
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
                className="text-gray-400 hover:text-sky-600 transition-colors p-1"
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
                className="w-full px-3 py-2 border border-sky-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateSprint(false)}
                className="px-3 py-1.5 border border-sky-100 text-gray-500 hover:bg-sky-50 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-750 text-white rounded-lg text-xs font-bold"
              >
                Create Sprint
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Start Sprint Modal */}
      {showStartSprint && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/35 z-55 flex items-center justify-center p-4">
          <form 
            onSubmit={handleStartSprint}
            className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn space-y-4"
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
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Sprint Goal</label>
                <textarea
                  placeholder="e.g. Finish core payment checkout integration"
                  value={startGoal}
                  onChange={(e) => setStartGoal(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStartSprint(null)}
                className="px-3 py-1.5 border border-sky-100 text-gray-500 hover:bg-sky-50 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white rounded-lg text-xs font-bold"
              >
                Start Sprint
              </button>
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
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">New Epic</h3>
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
                  placeholder="e.g. Workload Activation"
                  value={newEpicName}
                  onChange={(e) => setNewEpicName(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Color Tag</label>
                <select
                  value={newEpicColor}
                  onChange={(e) => setNewEpicColor(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm"
                >
                  <option value="sky">Blue (Sky)</option>
                  <option value="emerald">Green (Emerald)</option>
                  <option value="violet">Purple (Violet)</option>
                  <option value="amber">Amber</option>
                  <option value="rose">Red (Rose)</option>
                  <option value="indigo">Indigo</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">Description</label>
                <textarea
                  placeholder="High level feature set description"
                  value={newEpicDesc}
                  onChange={(e) => setNewEpicDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateEpic(false)}
                className="px-3 py-1.5 border border-sky-100 text-gray-500 hover:bg-sky-50 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-750 text-white rounded-lg text-xs font-bold"
              >
                Create Epic
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Backlog;
