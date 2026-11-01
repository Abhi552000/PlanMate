import React from "react";
import { Plus, Layers, FolderPlus } from "lucide-react";
import TaskModal from "../../components/TaskModal";
import { Button } from "../../components/ui/Button";
import { BacklogModals } from "./components/backlog/BacklogModals";
import { BacklogSprintAccordion } from "./components/backlog/BacklogSprintAccordion";
import { BacklogTasksSection } from "./components/backlog/BacklogTasksSection";
import { BacklogSkeleton } from "./components/backlog/BacklogSkeleton";
import { useBacklog } from "./hooks/useBacklog";
import { BACKLOG_TEXTS } from "../../constants/uiTexts";
import { calculateSprintMetrics } from "../../utils";

export const Backlog: React.FC = () => {
  const {
    sprints,
    backlogTasks,
    epics,
    loading,
    selectedEpicFilter,
    setSelectedEpicFilter,
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
    openSections,
    toggleSection,
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
  } = useBacklog();

  if (loading && sprints.length === 0) {
    return <BacklogSkeleton />;
  }

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {BACKLOG_TEXTS.PAGE_TITLE}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {BACKLOG_TEXTS.PAGE_SUBTITLE}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateSprint(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            {BACKLOG_TEXTS.BTN_CREATE_SPRINT}
          </Button>
        </div>
      </div>

      {/* Epic Filter Tabs Row (Responsive Horizontal Scroll) */}
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-200/80 dark:border-slate-800/80 overflow-x-auto no-scrollbar">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1 shrink-0">
          <Layers className="w-3.5 h-3.5" /> {BACKLOG_TEXTS.FILTER_EPICS}
        </span>
        <Button
          variant={!selectedEpicFilter ? "primary" : "outline"}
          size="sm"
          onClick={() => setSelectedEpicFilter(null)}
          className="shrink-0"
        >
          {BACKLOG_TEXTS.EPICS_FILTER_ALL}
        </Button>
        {epics.map((epic) => (
          <Button
            key={epic._id}
            variant={selectedEpicFilter === epic._id ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedEpicFilter(epic._id)}
            className="shrink-0"
            icon={
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  epic.color === "emerald"
                    ? "bg-emerald-500"
                    : epic.color === "violet"
                    ? "bg-violet-500"
                    : epic.color === "amber"
                    ? "bg-amber-500"
                    : epic.color === "rose"
                    ? "bg-rose-500"
                    : epic.color === "indigo"
                    ? "bg-indigo-500"
                    : "bg-sky-500"
                }`}
              />
            }
          >
            {epic.name}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCreateEpic(true)}
          icon={<FolderPlus className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
          className="sm:ml-auto shrink-0"
        >
          {BACKLOG_TEXTS.BTN_NEW_EPIC}
        </Button>
      </div>

      <div className="w-full space-y-5 sm:space-y-6">
        {/* Planned / Active Sprints */}
        {sprints.map((sprint) => {
          const filteredTasks = filterByEpic(sprint.tasks || []);
          const { todo, progress, done } =
            calculateSprintMetrics(filteredTasks);
          return (
            <BacklogSprintAccordion
              key={sprint._id}
              sprint={sprint}
              isCollapsed={!openSections[sprint._id]}
              onToggleCollapse={() => toggleSection(sprint._id)}
              expandedSprintId={expandedSprintId}
              setExpandedSprintId={setExpandedSprintId}
              filteredTasks={filteredTasks}
              todo={todo}
              progress={progress}
              done={done}
              setShowStartSprint={setShowStartSprint}
              setConfirmCompleteSprintId={setConfirmCompleteSprintId}
              setConfirmDeleteSprintId={setConfirmDeleteSprintId}
              handleMoveTask={handleMoveTask}
              setSelectedTaskToEdit={setSelectedTaskToEdit}
              setIsTaskModalOpen={setIsTaskModalOpen}
              activeInlineCreator={activeInlineCreator}
              setActiveInlineCreator={setActiveInlineCreator}
              inlineIssueType={inlineIssueType}
              setInlineIssueType={setInlineIssueType}
              inlineTitle={inlineTitle}
              setInlineTitle={setInlineTitle}
              handleCreateInlineIssue={handleCreateInlineIssue}
              creatingInlineIssue={creatingInlineIssue}
              sprints={sprints}
            />
          );
        })}

        {/* BACKLOG ISSUES CONTAINER */}
        <BacklogTasksSection
          isCollapsed={!openSections["backlog"]}
          onToggleCollapse={() => toggleSection("backlog")}
          expandedSprintId={expandedSprintId}
          setExpandedSprintId={setExpandedSprintId}
          backlogTasks={backlogTasks}
          filterByEpic={filterByEpic}
          handleMoveTask={handleMoveTask}
          setSelectedTaskToEdit={setSelectedTaskToEdit}
          setIsTaskModalOpen={setIsTaskModalOpen}
          activeInlineCreator={activeInlineCreator}
          setActiveInlineCreator={setActiveInlineCreator}
          inlineIssueType={inlineIssueType}
          setInlineIssueType={setInlineIssueType}
          inlineTitle={inlineTitle}
          setInlineTitle={setInlineTitle}
          handleCreateInlineIssue={handleCreateInlineIssue}
          creatingInlineIssue={creatingInlineIssue}
          sprints={sprints}
        />
      </div>

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

      <BacklogModals
        showCreateSprint={showCreateSprint}
        setShowCreateSprint={setShowCreateSprint}
        newSprintName={newSprintName}
        setNewSprintName={setNewSprintName}
        creatingSprint={creatingSprint}
        handleCreateSprint={handleCreateSprint}
        showStartSprint={showStartSprint}
        setShowStartSprint={setShowStartSprint}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        startGoal={startGoal}
        setStartGoal={setStartGoal}
        startingSprint={startingSprint}
        handleStartSprint={handleStartSprint}
        showCreateEpic={showCreateEpic}
        setShowCreateEpic={setShowCreateEpic}
        newEpicName={newEpicName}
        setNewEpicName={setNewEpicName}
        newEpicColor={newEpicColor}
        setNewEpicColor={setNewEpicColor}
        newEpicDesc={newEpicDesc}
        setNewEpicDesc={setNewEpicDesc}
        creatingEpic={creatingEpic}
        handleCreateEpic={handleCreateEpic}
        confirmCompleteSprintId={confirmCompleteSprintId}
        setConfirmCompleteSprintId={setConfirmCompleteSprintId}
        completingSprint={completingSprint}
        handleConfirmCompleteSprint={handleConfirmCompleteSprint}
        confirmDeleteSprintId={confirmDeleteSprintId}
        setConfirmDeleteSprintId={setConfirmDeleteSprintId}
        deletingSprint={deletingSprint}
        handleConfirmDeleteSprint={handleConfirmDeleteSprint}
      />
    </div>
  );
};

export default Backlog;
