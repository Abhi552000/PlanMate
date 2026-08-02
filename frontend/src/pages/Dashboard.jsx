import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  ADD_BUTTON,
  EMPTY_STATE,
  FILTER_LABELS,
  FILTER_OPTIONS,
  FILTER_WRAPPER,
  HEADER,
  ICON_WRAPPER,
  LABEL_CLASS,
  SELECT_CLASSES,
  STAT_CARD,
  STATS,
  STATS_GRID,
  TAB_ACTIVE,
  TAB_BASE,
  TAB_INACTIVE,
  TABS_WRAPPER,
  VALUE_CLASS,
  WRAPPER,
} from "../assets/dummy";
import { CalendarIcon, Filter, HomeIcon, Plus, Search, LayoutGrid, List, X } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import TaskModal from "../components/TaskModal";
import TaskItem from "../components/TaskItem";
import KanbanBoard from "../components/KanbanBoard";
import axiosInstance from "../config";

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [members, setMembers] = useState([]);

  const { tasks, refreshTasks, viewMode, setViewMode } = useOutletContext();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const { data } = await axiosInstance.get("/api/organization/members");
        if (data?.success && data?.members) {
          setMembers(data.members);
        }
      } catch (err) {
        console.error("Error fetching members inside Dashboard:", err);
      }
    };
    fetchMembers();
  }, []);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      lowPriority: tasks.filter((t) => t.priority?.toLowerCase() === "low")
        .length,
      mediumPriority: tasks.filter(
        (t) => t.priority?.toLowerCase() === "medium"
      ).length,
      highPriority: tasks.filter((t) => t.priority?.toLowerCase() === "high")
        .length,
      completed: tasks.filter(
        (t) =>
          t.completed === true ||
          t.completed === 1 ||
          (typeof t.completed === "string" &&
            t.completed.toLowerCase() === "yes")
      ).length,
    }),
    [tasks]
  );

  // FILTER TASKS (Jira-style multicriteria filtering)
  const filterTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Global Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = task.title?.toLowerCase().includes(query);
        const matchDesc = task.description?.toLowerCase().includes(query);
        const matchKey = task.key?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchKey) return false;
      }

      // 2. Assignee Filter
      if (selectedAssignee !== "all") {
        if (selectedAssignee === "unassigned") {
          if (task.assignee) return false;
        } else {
          const taskAssigneeId = task.assignee?._id || task.assignee;
          if (taskAssigneeId !== selectedAssignee) return false;
        }
      }

      // 3. Priority Filter
      if (selectedPriority !== "all") {
        if (task.priority?.toLowerCase() !== selectedPriority) return false;
      }

      // 4. Status Filter
      if (selectedStatus !== "all") {
        if (task.status !== selectedStatus) return false;
      }

      // 5. Timeframe Filter
      if (selectedTimeframe !== "all") {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        if (!dueDate) return false;
        
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        if (selectedTimeframe === "today") {
          if (dueDate.toDateString() !== today.toDateString()) return false;
        } else if (selectedTimeframe === "week") {
          if (dueDate < today || dueDate > nextWeek) return false;
        }
      }

      return true;
    });
  }, [tasks, searchQuery, selectedAssignee, selectedPriority, selectedStatus, selectedTimeframe]);

  // SAVING TASKS
  const handleTaskSave = useCallback(
    async (taskData) => {
      try {
        if (taskData.id)
          await axiosInstance.put(`/api/tasks/${taskData.id}/gp`, taskData);
        refreshTasks();
        setShowModal(false);
        setSelectedTask(null);
      } catch (error) {
        console.log("Error saving tasks:", error);
      }
    },
    [refreshTasks]
  );


  return (
    <div className={WRAPPER}>
      {/* HEADER */}
      <div className={HEADER}>
        <div className=" min-w-0">
          <h1 className=" text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <HomeIcon className=" text-sky-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className=" truncate">Task Overview</span>
          </h1>
          <p className=" text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7 truncate">
            Manage your tasks efficiently
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className={ADD_BUTTON}>
          <Plus size={18} />
          Add New Task
        </button>
      </div>
      {/* STATS */}
      <div className={STATS_GRID}>
        {STATS.map(
          ({
            key,
            label,
            icon: Icon,
            iconColor,
            borderColor = "border-sky-100",
            valueKey,
            textColor,
            gradient,
          }) => (
            <div key={key} className={`${STAT_CARD} ${borderColor}`}>
              <div className=" flex items-center gap-2 md:gap-3">
                <div className={`${ICON_WRAPPER} ${iconColor}`}>
                  <Icon className=" w-4 h-4 md:w-5 md:h-5" />
                </div>

                <div className=" min-w-0">
                  <p
                    className={`${VALUE_CLASS} ${
                      gradient
                        ? "bg-gradient-to-r from-cyan-500 to-sky-600 bg-clip-text text-transparent"
                        : textColor
                    }`}
                  >
                    {stats[valueKey]}
                  </p>
                  <p className={LABEL_CLASS}>{label}</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* CONTENTS */}
      <div className=" space-y-6">
        {/* JIRA FILTERS BAR */}
        <div className="flex flex-col gap-4 bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-sky-100 dark:border-gray-800 shadow-sm">
          {/* Top Row: Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px] sm:min-w-[280px] flex-1">
              <input
                type="text"
                placeholder="Search issues (title, desc, key)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2 bg-gray-50/50 dark:bg-gray-950 border border-sky-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4 text-sky-500" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sky-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Assignee Filter Dropdown */}
            <div className="flex flex-col gap-0.5">
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="px-3 py-2 bg-gray-50/50 dark:bg-gray-950 border border-sky-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="all">Assignee: All</option>
                <option value="unassigned">Unassigned</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    Assignee: {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter Dropdown */}
            <div className="flex flex-col gap-0.5">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 bg-gray-50/50 dark:bg-gray-950 border border-sky-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="all">Priority: All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex flex-col gap-0.5">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-gray-50/50 dark:bg-gray-950 border border-sky-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Timeframe Date Filter Dropdown */}
            <div className="flex flex-col gap-0.5">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 bg-gray-50/50 dark:bg-gray-950 border border-sky-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="all">Timeframe: All</option>
                <option value="today">Due: Today</option>
                <option value="week">Due: This Week</option>
              </select>
            </div>

            {/* Clear Filters (conditional) */}
            {(searchQuery || selectedAssignee !== "all" || selectedPriority !== "all" || selectedStatus !== "all" || selectedTimeframe !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedAssignee("all");
                  setSelectedPriority("all");
                  setSelectedStatus("all");
                  setSelectedTimeframe("all");
                }}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 px-2 py-1 rounded-md transition-colors cursor-pointer hover:bg-sky-50 dark:hover:bg-gray-800"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Bottom Row: View Mode Toggle */}
          <div className="flex justify-between items-center pt-3 border-t border-sky-100/50 dark:border-gray-800/50 text-xs">
            <span className="font-semibold text-gray-500 dark:text-gray-400">
              Showing {filterTasks.length} of {tasks.length} issues
            </span>

            <div className="flex bg-sky-50 dark:bg-gray-850 p-1 rounded-lg border border-sky-100/50 dark:border-gray-750">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-700 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-100 dark:border-gray-600 font-bold"
                    : "text-gray-650 dark:text-gray-400 hover:text-sky-700 dark:hover:text-sky-300"
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  viewMode === "kanban"
                    ? "bg-white dark:bg-gray-700 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-100 dark:border-gray-600 font-bold"
                    : "text-gray-650 dark:text-gray-400 hover:text-sky-700 dark:hover:text-sky-300"
                }`}
                title="Kanban Board"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Board
              </button>
            </div>
          </div>
        </div>

        {/* VIEW CONTAINER */}
        <div>
          {viewMode === "kanban" ? (
            <KanbanBoard 
              tasks={filterTasks}
              onRefresh={refreshTasks}
              onEdit={(task) => {
                setSelectedTask(task);
                setShowModal(true);
              }}
              onLogout={refreshTasks}
            />
          ) : (
            <div className=" space-y-4">
              {filterTasks.length === 0 ? (
                <div className={EMPTY_STATE.wrapper}>
                  <div className={EMPTY_STATE.iconWrapper}>
                    <CalendarIcon className=" w-8 h-8 text-sky-500" />
                  </div>

                  <h3 className=" text-lg font-semibold text-gray-800 mb-2">
                    No tasks found
                  </h3>
                  <p className=" text-sm text-gray-500 mb-4">
                    {filter === "all"
                      ? "Create your first task to get started"
                      : "No tasks match this filter"}
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className={EMPTY_STATE.btn}
                  >
                    Add New Task
                  </button>
                </div>
              ) : (
                filterTasks.map((task) => (
                  <TaskItem
                    key={task._id || task.id}
                    task={task}
                    onRefresh={refreshTasks}
                    showCompleteCheckbox
                    onEdit={() => {
                      setSelectedTask(task);
                      setShowModal(true);
                    }}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* ADD TASKS DESKTOP */}
        <div
          onClick={() => setShowModal(true)}
          className=" hidden md:flex items-center justify-center p-4 border-2 border-dashed 
        border-sky-200 dark:border-gray-800 rounded-xl hover:border-sky-400 dark:hover:border-sky-500 bg-sky-50/50 dark:bg-sky-950/10 cursor-pointer transition-colors"
        >
          <Plus className=" w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
          <span className=" text-gray-600 dark:text-gray-300 font-medium">Add New Task</span>
        </div>
      </div>

      {/* MODAL */}
      <TaskModal
        isOpen={showModal || !!selectedTask}
        onClose={() => {
          setShowModal(false);
          setSelectedTask(null);
        }}
        taskToEdit={selectedTask}
        onSave={handleTaskSave}
      />
    </div>
  );
};

export default Dashboard;
