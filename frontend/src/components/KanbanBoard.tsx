import React from "react";
import { taskService } from "../services/taskService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ITask, KanbanBoardProps } from "../types";
import { TOAST_MESSAGES, CONSOLE_ERRORS } from "../constants/messages";
import { KanbanColumn } from "./kanban/KanbanColumn";

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
      toast.error(TOAST_MESSAGES.TASK_BLOCKED_ERROR(blockTitles));
      return;
    }

    try {
      await taskService.updateTask(taskId, {
        status: newStatus,
        completed: newStatus === "Done" ? "Yes" : "No"
      });
      onRefresh?.();
    } catch (error: any) {
      console.error(CONSOLE_ERRORS.MOVE_TASK_ERROR, error);
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
      toast.error(TOAST_MESSAGES.TASK_BLOCKED_ERROR(blockTitles));
      return;
    }

    try {
      await taskService.updateTask(taskId, {
        status: col,
        completed: col === "Done" ? "Yes" : "No"
      });
      onRefresh?.();
    } catch (error: any) {
      console.error(CONSOLE_ERRORS.UPDATE_STATUS_DROP, error);
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
        return (
          <KanbanColumn
            key={col}
            col={col}
            columns={columns}
            colTasks={colTasks}
            activeOverColumn={activeOverColumn}
            handleDragOver={handleDragOver}
            handleDragEnter={handleDragEnter}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            handleDragStart={handleDragStart}
            handleStatusTransition={handleStatusTransition}
            navigate={navigate}
          />
        );
      })}
    </div>
  );
};

export default KanbanBoard;
