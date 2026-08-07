import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Calendar, 
  Layers, 
  CheckCircle,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  Flame,
  LayoutGrid,
  Filter
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchSprints, updateSprint } from "../../store/slices/sprintSlice";
import { fetchEpics } from "../../store/slices/epicSlice";
import { updateTask } from "../../store/slices/taskSlice";
import { orgService } from "../../services/orgService";
import TaskModal from "../../components/TaskModal";
import { ITask } from "../../types";

const EPIC_COLORS: Record<string, string> = {
  sky: "bg-sky-100 text-sky-850 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-850",
  emerald: "bg-emerald-100 text-emerald-850 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-850",
  violet: "bg-violet-100 text-violet-850 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-850",
  amber: "bg-amber-100 text-amber-850 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-850",
  rose: "bg-rose-100 text-rose-850 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-850",
  indigo: "bg-indigo-100 text-indigo-850 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-850",
};

export const ActiveSprint: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const activeSprint = useAppSelector((state) => state.sprints.activeSprint);
  const epics = useAppSelector((state) => state.epics.epics);
  const loading = useAppSelector((state) => state.sprints.loading || state.epics.loading);
  const [statuses, setStatuses] = useState<string[]>(["To Do", "In Progress", "Done"]);

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
      if (orgRes?.success && orgRes?.organization?.statuses) {
        setStatuses(orgRes.organization.statuses);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load active sprint data.");
    }
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Complete Sprint
  const handleCompleteSprint = async () => {
    if (!activeSprint) return;
    if (!window.confirm("Are you sure you want to complete this Sprint? All incomplete tasks will return to the backlog.")) return;
    try {
      await dispatch(updateSprint({ id: activeSprint._id, sprintData: { status: "completed" } })).unwrap();
      toast.success("Sprint completed successfully!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to complete sprint.");
    }
  };

  // Move Task Status
  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      await dispatch(updateTask({ id: taskId, taskData: { status: newStatus } })).unwrap();
      toast.success(`Task status updated to ${newStatus}`);
      loadData();
    } catch (err: any) {
      toast.error("Failed to update status.");
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
    if (!activeSprint || !activeSprint.endDate) return null;
    const diff = new Date(activeSprint.endDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days remaining` : "Sprint ended";
  }, [activeSprint]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-500" />
      </div>
    );
  }

  // EMPTY STATE: No Active Sprint
  if (!activeSprint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center space-y-5 font-sans animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg text-white animate-bounce">
          <Flame className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white">No Active Sprint</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sprint boards display issues belonging to your team's current active sprint. Get started by planning in your backlog.
          </p>
        </div>
        <button
          onClick={() => navigate("/backlog")}
          className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-sm transition-all cursor-pointer"
        >
          Go to Backlog <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // RENDER BOARD COLUMNS
  const renderBoardGrid = (sprintTasks: ITask[]) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4" style={{ gridTemplateColumns: `repeat(${statuses.length}, minmax(0, 1fr))` }}>
        {statuses.map((colName) => {
          const colTasks = sprintTasks.filter(t => t.status === colName);
          return (
            <div 
              key={colName} 
              className="bg-sky-50/20 dark:bg-gray-900 border border-sky-100/50 dark:border-gray-800 rounded-2xl p-3 flex flex-col min-h-[160px] max-h-[500px] overflow-y-auto"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const taskId = e.dataTransfer.getData("text/plain");
                if (taskId) handleUpdateStatus(taskId, colName);
              }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 shrink-0">
                <span className="text-xs font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">
                  {colName}
                </span>
                <span className="text-[10px] font-black bg-sky-50 text-sky-750 px-2 py-0.5 rounded border dark:bg-gray-850 dark:border-gray-800 dark:text-gray-400">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Tasks */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {colTasks.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", task._id)}
                    onClick={() => {
                      setSelectedTaskToEdit(task);
                      setIsTaskModalOpen(true);
                    }}
                    className="bg-white dark:bg-gray-950 border border-sky-100/40 dark:border-gray-850/60 rounded-xl p-3 shadow-xs hover:border-sky-305 dark:hover:border-sky-850 hover:shadow-xs transition-all cursor-pointer group space-y-2.5 relative"
                  >
                    <div className="space-y-1">
                      {task.key && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-150 select-all inline-block dark:bg-gray-900 dark:border-gray-800">
                          {task.key}
                        </span>
                      )}
                      <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-sky-600 line-clamp-2">
                        {task.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-sky-50/20">
                      {/* Epic Badge */}
                      {task.epic && typeof task.epic === "object" ? (
                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
                          EPIC_COLORS[(task.epic as any).color] || EPIC_COLORS.sky
                        }`}>
                          {(task.epic as any).name}
                        </span>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Story Points */}
                        {task.storyPoints !== undefined && (
                          <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-850 flex items-center justify-center text-[9px] font-black text-gray-500">
                            {task.storyPoints}
                          </span>
                        )}

                        {/* Assignee Avatar */}
                        {task.assignee ? (
                          <div
                            className="w-5 h-5 rounded-full bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-[8px] font-black text-sky-700 dark:text-sky-400 border border-sky-200"
                            title={typeof task.assignee === "object" ? (task.assignee as any).name : "Assigned"}
                          >
                            {typeof task.assignee === "object"
                              ? (task.assignee as any).name?.[0]?.toUpperCase()
                              : "A"}
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-dashed border-gray-300 flex items-center justify-center text-[8px] text-gray-400">
                            <User className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Active Sprint Header Info */}
      <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 p-4 sm:p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{activeSprint.name}</h1>
              <span className="text-[9px] font-black uppercase tracking-wider bg-sky-550 text-white px-2 py-0.5 rounded shadow-sm flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3" /> Active
              </span>
            </div>
            {activeSprint.goal && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">Goal: {activeSprint.goal}</p>
            )}
            {remainingDays && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-sky-500" /> {remainingDays}
              </p>
            )}
          </div>
          <button
            onClick={handleCompleteSprint}
            className="flex items-center gap-1 bg-sky-655 hover:bg-sky-750 text-white font-bold py-2 px-4 rounded-xl text-sm shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" /> Complete Sprint
          </button>
        </div>

        {/* Dashboard Filters & Grouping Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-sky-50 dark:border-gray-850">
          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filters
            </span>
            <button
              onClick={() => setOnlyMyIssues(!onlyMyIssues)}
              className={`px-3 py-1 text-xs font-bold border rounded-lg transition-all cursor-pointer ${
                onlyMyIssues 
                  ? "bg-sky-500 border-sky-600 text-white shadow-sm" 
                  : "bg-white border-sky-100 hover:bg-sky-50/50 text-gray-600 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400"
              }`}
            >
              Only My Issues
            </button>
            <button
              onClick={() => setHighPriorityOnly(!highPriorityOnly)}
              className={`px-3 py-1 text-xs font-bold border rounded-lg transition-all cursor-pointer ${
                highPriorityOnly 
                  ? "bg-sky-500 border-sky-600 text-white shadow-sm" 
                  : "bg-white border-sky-100 hover:bg-sky-50/50 text-gray-600 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400"
              }`}
            >
              High Priority Only
            </button>
          </div>

          {/* Grouping Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
              <LayoutGrid className="w-3.5 h-3.5" /> Group by
            </span>
            <button
              onClick={() => setGroupByEpic(!groupByEpic)}
              className={`px-3 py-1 text-xs font-bold border rounded-lg transition-all cursor-pointer ${
                groupByEpic 
                  ? "bg-sky-500 border-sky-600 text-white shadow-sm" 
                  : "bg-white border-sky-100 hover:bg-sky-50/50 text-gray-600 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400"
              }`}
            >
              Epic Swimlanes
            </button>
          </div>
        </div>
      </div>

      {/* SCRUM BOARD GRID AREA */}
      <div className="w-full">
        {!groupByEpic ? (
          // Regular Board
          renderBoardGrid(filteredTasks)
        ) : (
          // Epic Swimlanes Board
          <div className="space-y-6">
            {/* 1. Epic Swimlanes list */}
            {epics.map((epic) => {
              const epicTasks = tasksByEpic[epic._id] || [];
              if (epicTasks.length === 0) return null; // Skip empty swimlanes

              return (
                <div key={epic._id} className="space-y-2.5 border-b border-sky-100/30 pb-4">
                  {/* Swimlane Title banner */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-sky-100/30">
                    <Layers className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                      Epic: {epic.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold bg-white dark:bg-gray-950 px-2 py-0.5 rounded-lg border">
                      {epicTasks.length} Issues
                    </span>
                  </div>
                  {renderBoardGrid(epicTasks)}
                </div>
              );
            })}

            {/* 2. Fallback Swimlane (Unassigned Issues) */}
            {tasksByEpic.unassigned.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-sky-100/30">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                    Issues without Epics
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold bg-white dark:bg-gray-950 px-2 py-0.5 rounded-lg border">
                    {tasksByEpic.unassigned.length} Issues
                  </span>
                </div>
                {renderBoardGrid(tasksByEpic.unassigned)}
              </div>
            )}
          </div>
        )}
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
    </div>
  );
};

export default ActiveSprint;
