import React from "react";
import { Layers, Flame, ArrowRight, Sparkles } from "lucide-react";
import TaskModal from "../../components/TaskModal";
import { ActiveSprintHeader } from "./components/active-sprint/ActiveSprintHeader";
import { ActiveSprintFilters } from "./components/active-sprint/ActiveSprintFilters";
import { ActiveSprintBoardColumn } from "./components/active-sprint/ActiveSprintBoardColumn";
import { ConfirmCompleteSprintModal } from "./components/active-sprint/ConfirmCompleteSprintModal";
import { useActiveSprint } from "./hooks/useActiveSprint";
import { ACTIVE_SPRINT_TEXTS } from "../../constants/uiTexts";

export const ActiveSprint: React.FC = () => {
  const {
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
  } = useActiveSprint();

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
          <h2 className="text-2xl font-black text-gray-800 dark:text-white">
            {ACTIVE_SPRINT_TEXTS.EMPTY_ACTIVE_SPRINT_TITLE}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {ACTIVE_SPRINT_TEXTS.EMPTY_ACTIVE_SPRINT_DESC}
          </p>
        </div>
        <button
          onClick={() => navigate("/backlog")}
          className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow-sm transition-all cursor-pointer"
        >
          {ACTIVE_SPRINT_TEXTS.BTN_GO_TO_BACKLOG}{" "}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Active Sprint Header Info */}
      <ActiveSprintHeader
        activeSprint={activeSprint}
        remainingDays={remainingDays}
        handleCompleteSprint={handleCompleteSprint}
      />

      {/* Dashboard Filters & Grouping Row */}
      <ActiveSprintFilters
        onlyMyIssues={onlyMyIssues}
        setOnlyMyIssues={setOnlyMyIssues}
        highPriorityOnly={highPriorityOnly}
        setHighPriorityOnly={setHighPriorityOnly}
        groupByEpic={groupByEpic}
        setGroupByEpic={setGroupByEpic}
      />

      {/* SCRUM BOARD GRID AREA */}
      <div className="w-full">
        {!groupByEpic ? (
          <ActiveSprintBoardColumn
            statuses={statuses}
            sprintTasks={filteredTasks}
            handleUpdateStatus={handleUpdateStatus}
            setSelectedTaskToEdit={setSelectedTaskToEdit}
            setIsTaskModalOpen={setIsTaskModalOpen}
          />
        ) : (
          <div className="space-y-6">
            {/* 1. Epic Swimlanes list */}
            {epics.map((epic) => {
              const epicTasks = tasksByEpic[epic._id] || [];
              if (epicTasks.length === 0) return null; // Skip empty swimlanes

              return (
                <div
                  key={epic._id}
                  className="space-y-2.5 border-b border-sky-100/30 pb-4"
                >
                  {/* Swimlane Title banner */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-sky-100/30">
                    <Layers className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                      {ACTIVE_SPRINT_TEXTS.SWIMLANE_EPIC}: {epic.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold bg-white dark:bg-gray-950 px-2 py-0.5 rounded-lg border">
                      {epicTasks.length} {ACTIVE_SPRINT_TEXTS.SWIMLANE_ISSUES}
                    </span>
                  </div>
                  <ActiveSprintBoardColumn
                    statuses={statuses}
                    sprintTasks={epicTasks}
                    handleUpdateStatus={handleUpdateStatus}
                    setSelectedTaskToEdit={setSelectedTaskToEdit}
                    setIsTaskModalOpen={setIsTaskModalOpen}
                  />
                </div>
              );
            })}

            {/* 2. Fallback Swimlane (Unassigned Issues) */}
            {tasksByEpic.unassigned.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-xl border border-sky-100/30">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                    {ACTIVE_SPRINT_TEXTS.SWIMLANE_UNASSIGNED}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold bg-white dark:bg-gray-950 px-2 py-0.5 rounded-lg border">
                    {tasksByEpic.unassigned.length}{" "}
                    {ACTIVE_SPRINT_TEXTS.SWIMLANE_ISSUES}
                  </span>
                </div>
                <ActiveSprintBoardColumn
                  statuses={statuses}
                  sprintTasks={tasksByEpic.unassigned}
                  handleUpdateStatus={handleUpdateStatus}
                  setSelectedTaskToEdit={setSelectedTaskToEdit}
                  setIsTaskModalOpen={setIsTaskModalOpen}
                />
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
            loadData();
          }}
          taskToEdit={selectedTaskToEdit}
          onSave={loadData}
        />
      )}

      <ConfirmCompleteSprintModal
        showConfirmComplete={showConfirmComplete}
        setShowConfirmComplete={setShowConfirmComplete}
        completingSprint={completingSprint}
        handleConfirmComplete={handleConfirmComplete}
      />
    </div>
  );
};

export default ActiveSprint;
