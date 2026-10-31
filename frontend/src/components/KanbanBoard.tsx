import React, { useMemo, useCallback } from "react";
import { taskService } from "../services/taskService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ITask, KanbanBoardProps } from "../types";
import { TOAST_MESSAGES, CONSOLE_ERRORS } from "../constants/messages";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { useAppDispatch } from "../store";
import { updateTaskOptimistic } from "../store/slices/taskSlice";
import { DEFAULT_STATUSES } from "../utils/statusUtils";

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onRefresh,
  onEdit,
  onLogout,
  columns = DEFAULT_STATUSES,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeOverColumn, setActiveOverColumn] = React.useState<string | null>(null);

  // Group tasks by status with useMemo to avoid recomputing on every render
  const groupedTasks = useMemo(() => {
    return columns.reduce<Record<string, ITask[]>>((acc, col) => {
      acc[col] = tasks.filter((t) => {
        const status = t.status || (t.completed ? "Done" : "To Do");
        return status === col;
      });
      return acc;
    }, {});
  }, [columns, tasks]);

  const handleStatusTransition = useCallback(
    async (taskId: string, newStatus: string) => {
      const task = tasks.find((t) => t._id === taskId);
      if (!task) return;

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

      const prevStatus = task.status || (task.completed ? "Done" : "To Do");
      const prevCompleted = task.completed;
      const isNewDone = newStatus === "Done";

      // 1. Optimistic UI update - instantaneous
      dispatch(
        updateTaskOptimistic({
          id: taskId,
          status: newStatus,
          completed: isNewDone ? "Yes" : "No",
        })
      );

      // 2. Perform background server update
      try {
        await taskService.updateTask(taskId, {
          status: newStatus,
          completed: isNewDone ? "Yes" : "No",
        });
        onRefresh?.();
      } catch (error: any) {
        console.error(CONSOLE_ERRORS.MOVE_TASK_ERROR, error);
        // Rollback on failure
        dispatch(
          updateTaskOptimistic({
            id: taskId,
            status: prevStatus,
            completed: prevCompleted,
          })
        );
        toast.error("Failed to update task status");
        if (error.response?.status === 401) onLogout?.();
      }
    },
    [tasks, dispatch, onLogout, onRefresh]
  );

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, col: string) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, col: string) => {
    e.preventDefault();
    setActiveOverColumn(col);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, col: string) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("text/plain");
      setActiveOverColumn(null);
      if (!taskId) return;

      const task = tasks.find((t) => t._id === taskId);
      if (!task) return;

      const currentStatus = task.status || (task.completed ? "Done" : "To Do");
      if (currentStatus === col) return; // No change needed

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

      const prevStatus = currentStatus;
      const prevCompleted = task.completed;
      const isNewDone = col === "Done";

      // 1. Optimistic UI update - instantaneous
      dispatch(
        updateTaskOptimistic({
          id: taskId,
          status: col,
          completed: isNewDone ? "Yes" : "No",
        })
      );

      // 2. Perform background server update
      try {
        await taskService.updateTask(taskId, {
          status: col,
          completed: isNewDone ? "Yes" : "No",
        });
        onRefresh?.();
      } catch (error: any) {
        console.error(CONSOLE_ERRORS.UPDATE_STATUS_DROP, error);
        // Rollback on failure
        dispatch(
          updateTaskOptimistic({
            id: taskId,
            status: prevStatus,
            completed: prevCompleted,
          })
        );
        toast.error("Failed to update task status");
        if (error.response?.status === 401) onLogout?.();
      }
    },
    [tasks, dispatch, onLogout, onRefresh]
  );

  return (
    <div
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      className="flex flex-row overflow-x-auto gap-4 lg:gap-5 pt-2 pb-4 md:grid md:items-start select-none max-w-full snap-x snap-mandatory scroll-smooth -mx-3.5 px-3.5 sm:mx-0 sm:px-0"
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

export default React.memo(KanbanBoard);
