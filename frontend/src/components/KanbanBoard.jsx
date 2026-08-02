import React from "react";
import { 
  Bug, 
  BookOpen, 
  CheckSquare, 
  Award, 
  Calendar, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Trash2, 
  Edit 
} from "lucide-react";
import axiosInstance from "../config";
import { useNavigate } from "react-router-dom";

const getIssueTypeIcon = (type) => {
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

const getIssueTypeLeftBorder = (type) => {
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

const getPriorityStyle = (priority) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50";
    case "medium":
      return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50";
    default:
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50";
  }
};

const KanbanBoard = ({ tasks, onRefresh, onEdit, onLogout }) => {
  const navigate = useNavigate();
  const columns = ["To Do", "In Progress", "Done"];
  const [activeOverColumn, setActiveOverColumn] = React.useState(null);

  // Group tasks by status
  const groupedTasks = columns.reduce((acc, col) => {
    acc[col] = tasks.filter((t) => {
      const status = t.status || (t.completed ? "Done" : "To Do");
      return status === col;
    });
    return acc;
  }, {});

  const handleStatusTransition = async (taskId, newStatus) => {
    try {
      await axiosInstance.put(`/api/tasks/${taskId}/gp`, {
        status: newStatus,
        completed: newStatus === "Done" ? "Yes" : "No"
      });
      onRefresh?.();
    } catch (error) {
      console.error("Error moving task:", error);
      if (error.response?.status === 401) onLogout?.();
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await axiosInstance.delete(`/api/tasks/${taskId}/gp`);
      onRefresh?.();
    } catch (error) {
      console.error("Error deleting task:", error);
      if (error.response?.status === 401) onLogout?.();
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, col) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, col) => {
    e.preventDefault();
    setActiveOverColumn(col);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, col) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    setActiveOverColumn(null);
    if (!taskId) return;

    try {
      await axiosInstance.put(`/api/tasks/${taskId}/gp`, {
        status: col,
        completed: col === "Done" ? "Yes" : "No"
      });
      onRefresh?.();
    } catch (error) {
      console.error("Error updating status on drop:", error);
      if (error.response?.status === 401) onLogout?.();
    }
  };

  return (
    <div className="flex flex-row overflow-x-auto gap-4 md:gap-6 pt-4 pb-4 md:grid md:grid-cols-3 md:items-start select-none max-w-full">
      {columns.map((col) => {
        const colTasks = groupedTasks[col] || [];
        const totalPoints = colTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

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
                <span className="font-bold text-gray-700 dark:text-gray-355 text-sm tracking-wide uppercase">
                  {col}
                </span>
                <span className="bg-sky-100/80 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {colTasks.length}
                </span>
              </div>
              {totalPoints > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200/60 dark:bg-gray-800 px-2 py-0.5 rounded font-medium">
                  {totalPoints} SP
                </span>
              )}
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
              {colTasks.map((task) => {
                const sp = task.storyPoints !== undefined ? task.storyPoints : 1;
                const type = task.issueType || "Task";
                
                return (
                  <div 
                    key={task._id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    onClick={(e) => {
                      if (e.target.closest("button") || e.target.closest("select")) return;
                      navigate(`/task/${task._id}`);
                    }}
                    className={`bg-white dark:bg-gray-950 border rounded-lg p-3.5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 group cursor-grab active:cursor-grabbing ${getIssueTypeLeftBorder(type)}`}
                  >
                    <div>
                       {/* Top Row: Type & Actions */}
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {getIssueTypeIcon(type)}
                          <span className="text-[10px] font-black tracking-wider uppercase text-sky-700 bg-sky-100/50 px-1.5 py-0.5 rounded border border-sky-200">
                            {task.key || `PM-${task._id ? task._id.slice(-4).toUpperCase() : "TASK"}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => navigate(`/task/${task._id}`)}
                            className="p-1 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
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
                        
                        {/* Story Points */}
                        <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded" title="Story Points">
                          {sp} SP
                        </span>
 
                        {/* Assignee Avatar */}
                        {task.assignee && (
                          <div 
                            className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400 flex items-center justify-center font-extrabold text-[8px] border border-sky-200 dark:border-sky-850 uppercase shrink-0" 
                            title={`Assigned to: ${task.assignee.name} (${task.assignee.email})`}
                          >
                            {task.assignee.name.split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                        )}
                      </div>

                      {/* Column transition controls */}
                      <div className="flex items-center gap-1">
                        {col !== "To Do" && (
                          <button 
                            onClick={() => {
                              const prevIdx = columns.indexOf(col) - 1;
                              handleStatusTransition(task._id, columns[prevIdx]);
                            }}
                            className="p-1 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded transition-colors"
                            title="Move Left"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {col !== "Done" && (
                          <button 
                            onClick={() => {
                              const nextIdx = columns.indexOf(col) + 1;
                              handleStatusTransition(task._id, columns[nextIdx]);
                            }}
                            className="p-1 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded transition-colors"
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
