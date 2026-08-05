import React from "react";
import { 
  Bug, 
  BookOpen, 
  CheckSquare, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  Edit 
} from "lucide-react";
import { taskService } from "../services/taskService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ITask } from "../types";

const getIssueTypeIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "bug":
      return <Bug className="w-4 h-4 text-red-500 fill-red-50" />;
    case "story":
      return <BookOpen className="w-4 h-4 text-green-500 fill-green-50" />;
    case "epic":
      return <Award className="w-4 h-4 text-purple-600 fill-purple-50" />;
    default:
      return <CheckSquare className="w-4 h-4 text-sky-500 fill-sky-50" />;
  }
};

const getIssueTypeLeftBorder = (type: string) => {
  switch (type?.toLowerCase()) {
    case "bug":
      return "border-l-4 border-l-red-500 border-y-sky-100 dark:border-y-gray-800 border-r-sky-100 dark:border-r-gray-800";
    case "story":
      return "border-l-4 border-l-green-500 border-y-sky-100 dark:border-y-gray-800 border-r-sky-100 dark:border-r-gray-800";
    case "epic":
      return "border-l-4 border-l-purple-600 border-y-sky-100 dark:border-y-gray-800 border-r-sky-100 dark:border-r-gray-800";
    default:
      return "border-l-4 border-l-sky-500 border-y-sky-100 dark:border-y-gray-800 border-r-sky-100 dark:border-r-gray-800";
  }
};

const getPriorityStyle = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50";
    case "medium":
      return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50";
    default:
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50";
  }
};

interface KanbanBoardProps {
  tasks: ITask[];
  onRefresh?: () => void;
  onEdit?: (task: ITask) => void;
  onLogout?: () => void;
  columns?: string[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onRefresh, onEdit, onLogout, columns = ["To Do", "In Progress", "Done"] }) => {
  const navigate = useNavigate();
  const [activeOverColumn, setActiveOverColumn] = React.useState<string | null>(null);

  // Group tasks by status
  const groupedTasks = columns.reduce<Record<string, ITask[]>>((acc, col) => {
    acc[col] = tasks.filter((t) => {
      const status = t.status || (t.completed ? "Done" : "To Do");
      return status === col;
    });
    return acc;
  }, {});

  const handleStatusTransition = async (taskId: string, newStatus: string) => {
    const task = tasks.find((t) => t._id === taskId);
    const blockedByLinks = task?.links?.filter((l) => l.linkType === "blocked by") || [];
    const activeBlocks = blockedByLinks.filter((l) => {
      const target = l.targetTask;
      if (!target) return false;
      const isTargetDone =
        target.completed === true ||
        target.completed === "Yes" ||
        target.status?.toLowerCase() === "done";
      return !isTargetDone;
    });

    if (activeBlocks.length > 0) {
      const blockTitles = activeBlocks
        .map((l) => (l.targetTask?.key ? `[${l.targetTask.key}]` : l.targetTask?.title || "another task"))
        .join(", ");
      toast.error(`Cannot move task. It is blocked by: ${blockTitles}`);
      return;
    }

    try {
      await taskService.updateTask(taskId, {
        status: newStatus,
        completed: newStatus === "Done" ? "Yes" : "No"
      });
      onRefresh?.();
    } catch (error: any) {
      console.error("Error moving task:", error);
      if (error.response?.status === 401) onLogout?.();
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, col: string) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    setActiveOverColumn(col);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, col: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    setActiveOverColumn(null);
    if (!taskId) return;

    const task = tasks.find((t) => t._id === taskId);
    const blockedByLinks = task?.links?.filter((l) => l.linkType === "blocked by") || [];
    const activeBlocks = blockedByLinks.filter((l) => {
      const target = l.targetTask;
      if (!target) return false;
      const isTargetDone =
        target.completed === true ||
        target.completed === "Yes" ||
        target.status?.toLowerCase() === "done";
      return !isTargetDone;
    });

    if (activeBlocks.length > 0) {
      const blockTitles = activeBlocks
        .map((l) => (l.targetTask?.key ? `[${l.targetTask.key}]` : l.targetTask?.title || "another task"))
        .join(", ");
      toast.error(`Cannot move task. It is blocked by: ${blockTitles}`);
      return;
    }

    try {
      await taskService.updateTask(taskId, {
        status: col,
        completed: col === "Done" ? "Yes" : "No"
      });
      onRefresh?.();
    } catch (error: any) {
      console.error("Error updating status on drop:", error);
      if (error.response?.status === 401) onLogout?.();
    }
  };

  return (
    <div 
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      className="flex flex-row overflow-x-auto gap-4 md:gap-6 pt-4 pb-4 md:grid md:items-start select-none max-w-full"
    >
      {columns.map((col) => {
        const colTasks = groupedTasks[col] || [];
        const totalPoints = colTasks.length; // Count of tasks in this column

        return (
          <div 
            key={col} 
            onDragOver={(e) => handleDragOver(e, col)}
            onDragEnter={(e) => handleDragEnter(e, col)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col)}
            className={`border rounded-xl p-4 flex flex-col min-h-[500px] w-[290px] sm:w-[320px] md:w-full shrink-0 shadow-sm transition-all duration-200 ${
              activeOverColumn === col
                ? "bg-sky-100/70 dark:bg-sky-950/20 border-sky-300 dark:border-sky-700"
                : "bg-gray-50/70 dark:bg-gray-900/50 border-sky-100 dark:border-gray-800"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-sky-100/50 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700 dark:text-gray-300 text-sm tracking-wide uppercase">
                  {col}
                </span>
                <span className="bg-sky-100/80 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {colTasks.length}
                </span>
              </div>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {colTasks.map((task) => {
                const type = "Task";
                
                return (
                  <div 
                    key={task._id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest("button") || target.closest("select")) return;
                      navigate(`/task/${task._id}`);
                    }}
                    className={`bg-white dark:bg-gray-950 border rounded-lg p-3.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 group cursor-grab active:cursor-grabbing ${getIssueTypeLeftBorder(type)}`}
                  >
                    <div>
                      {/* Top Row: Type & Actions */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {getIssueTypeIcon(type)}
                          <span className="text-[10px] font-black tracking-wider uppercase text-sky-700 bg-sky-100/50 px-1.5 py-0.5 rounded border border-sky-200 dark:border-gray-800">
                            {task.key || `PM-${task._id ? task._id.slice(-4).toUpperCase() : "TASK"}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => navigate(`/task/${task._id}`)}
                            className="p-1 text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-gray-800 rounded transition-colors cursor-pointer"
                            title="Open Issue"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                        {task.title}
                      </h4>
  
                      {/* Description */}
                      {task.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Row: Attributes & Transitions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800 mt-1">
                      <div className="flex items-center gap-2">
                        {/* Priority */}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
                          {task.priority || "Low"}
                        </span>
                        
                        {/* Assignee Avatar */}
                        {task.assignee && (
                          <div 
                            className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 flex items-center justify-center font-extrabold text-[8px] border border-sky-200 dark:border-gray-800 uppercase shrink-0" 
                            title={`Assigned to: ${typeof task.assignee === 'object' ? task.assignee.name : 'Team Member'}`}
                          >
                            {typeof task.assignee === 'object' && task.assignee.name
                              ? task.assignee.name.split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2)
                              : "U"}
                          </div>
                        )}
                      </div>

                      {/* Column transition controls */}
                      <div className="flex items-center gap-1">
                        {columns.indexOf(col) > 0 && (
                          <button 
                            onClick={() => {
                              const prevIdx = columns.indexOf(col) - 1;
                              handleStatusTransition(task._id, columns[prevIdx]);
                            }}
                            className="p-1 bg-sky-50 dark:bg-sky-955 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-600 rounded transition-colors cursor-pointer"
                            title="Move Left"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {columns.indexOf(col) < columns.length - 1 && (
                          <button 
                            onClick={() => {
                              const nextIdx = columns.indexOf(col) + 1;
                              handleStatusTransition(task._id, columns[nextIdx]);
                            }}
                            className="p-1 bg-sky-50 dark:bg-sky-955 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-600 rounded transition-colors cursor-pointer"
                            title="Move Right"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {colTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-sky-100 dark:border-gray-800 rounded-lg bg-white/50 dark:bg-gray-900/50 text-center">
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                    No issues in this status
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
