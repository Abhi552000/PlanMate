import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  ADD_BUTTON,
  EMPTY_STATE,
  HEADER,
  ICON_WRAPPER,
  LABEL_CLASS,
  STAT_CARD,
  STATS_GRID,
  VALUE_CLASS,
  WRAPPER,
} from "../assets/dummy";
import { CalendarIcon, HomeIcon, Plus, Search, LayoutGrid, List, X, ChevronDown, Check, Flame, Inbox } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import TaskModal from "../components/TaskModal";
import TaskItem from "../components/TaskItem";
import KanbanBoard from "../components/KanbanBoard";
import { taskService } from "../services/taskService";
import { orgService } from "../services/orgService";
import { ITask, IUser } from "../types";

interface FilterSelectProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (val: string) => void;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const activeOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-3 py-2 bg-gray-50/50 dark:bg-gray-950 border border-sky-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 flex items-center gap-1.5 cursor-pointer transition-all duration-200"
      >
        <span>{label}: {activeOption?.label || value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-48 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-xl shadow-lg py-1.5 z-30 animate-fadeIn overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-xs transition-colors duration-150 flex items-center justify-between cursor-pointer ${
                opt.value === value
                  ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-sky-50/50 dark:hover:bg-gray-800"
              }`}
            >
              <span>{opt.label}</span>
              {opt.value === value && <Check className="w-3.5 h-3.5 text-sky-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

interface DashboardContext {
  tasks: ITask[];
  refreshTasks: (silent?: boolean) => void;
  viewMode: string;
  setViewMode: (val: string) => void;
}

const STATS = [
  {
    key: "total",
    label: "Total Tasks",
    icon: Inbox,
    iconColor: "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400",
    borderColor: "border-sky-100/50 dark:border-gray-800",
    valueKey: "total",
  },
  {
    key: "lowPriority",
    label: "Low Priority",
    icon: Flame,
    iconColor: "bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400",
    borderColor: "border-sky-100/50 dark:border-gray-800",
    valueKey: "lowPriority",
  },
  {
    key: "mediumPriority",
    label: "Medium Priority",
    icon: Flame,
    iconColor: "bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400",
    borderColor: "border-sky-100/50 dark:border-gray-800",
    valueKey: "mediumPriority",
  },
  {
    key: "highPriority",
    label: "High Priority",
    icon: Flame,
    iconColor: "bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400",
    borderColor: "border-sky-100/50 dark:border-gray-800",
    valueKey: "highPriority",
  },
];

const Dashboard = () => {
  const { tasks, refreshTasks, viewMode, setViewMode } = useOutletContext<DashboardContext>();
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [members, setMembers] = useState<IUser[]>([]);
  const [paginatedTasks, setPaginatedTasks] = useState<ITask[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasksCount, setTotalTasksCount] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [statuses, setStatuses] = useState<string[]>(["To Do", "In Progress", "Done"]);

  const fetchPaginatedListTasks = useCallback(async (page = 1, append = false) => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search: searchQuery,
        assignee: selectedAssignee,
        priority: selectedPriority,
        status: selectedStatus,
        timeframe: selectedTimeframe
      });
      const data = await taskService.getTasks(params);
      if (data?.success && data?.tasks) {
        if (append) {
          setPaginatedTasks((prev) => [...prev, ...data.tasks]);
        } else {
          setPaginatedTasks(data.tasks);
        }
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalTasksCount(data.pagination.totalCount);
      }
    } catch (err) {
      console.error("Error fetching paginated list tasks:", err);
    } finally {
      setLoadingList(false);
    }
  }, [searchQuery, selectedAssignee, selectedPriority, selectedStatus, selectedTimeframe]);

  useEffect(() => {
    if (viewMode === "list") {
      fetchPaginatedListTasks(1, false);
    }
  }, [viewMode, fetchPaginatedListTasks]);



  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await orgService.getOrgMembers();
        if (data?.success && data?.members) {
          setMembers(data.members);
        }
      } catch (err) {
        console.error("Error fetching members inside Dashboard:", err);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    const fetchOrgDetails = async () => {
      try {
        const data = await orgService.getOrgDetails();
        if (data?.success && data?.organization?.statuses) {
          setStatuses(data.organization.statuses);
        }
      } catch (err) {
        console.error("Error fetching org statuses inside Dashboard:", err);
      }
    };
    fetchOrgDetails();
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
    async (taskData: any) => {
      try {
        if (taskData.id)
          await taskService.updateTask(taskData.id, taskData);
        refreshTasks();
        if (viewMode === "list") {
          fetchPaginatedListTasks(1, false);
        }
        setShowModal(false);
        setSelectedTask(null);
      } catch (error) {
        console.log("Error saving tasks:", error);
      }
    },
    [refreshTasks, viewMode, fetchPaginatedListTasks]
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className={HEADER}>
        <div className=" min-w-0">
          <h1 className=" text-xl md:text-3xl font-bold text-gray-805 dark:text-gray-200 flex items-center gap-2">
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
            borderColor,
            valueKey,
          }) => (
            <div key={key} className={`${STAT_CARD} ${borderColor} dark:bg-gray-900/40 backdrop-blur-sm`}>
              <div className=" flex items-center gap-2 md:gap-3">
                <div className={`${ICON_WRAPPER} ${iconColor}`}>
                  <Icon className=" w-4 h-4 md:w-5 md:h-5" />
                </div>

                <div className=" min-w-0">
                  <p className={`${VALUE_CLASS} text-gray-800 dark:text-gray-100 font-bold`}>
                    {stats[valueKey as keyof typeof stats]}
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
        <div className="flex flex-col gap-3 bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-2xl border border-sky-100 dark:border-gray-800 shadow-sm">
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
            <FilterSelect
              label="Assignee"
              value={selectedAssignee}
              onChange={setSelectedAssignee}
              options={[
                { label: "All", value: "all" },
                { label: "Unassigned", value: "unassigned" },
                ...members.map((member) => ({ label: member.name, value: member._id })),
              ]}
            />

            {/* Priority Filter Dropdown */}
            <FilterSelect
              label="Priority"
              value={selectedPriority}
              onChange={setSelectedPriority}
              options={[
                { label: "All", value: "all" },
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" },
              ]}
            />

            {/* Status Filter Dropdown */}
            <FilterSelect
              label="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { label: "All", value: "all" },
                ...statuses.map(s => ({ label: s, value: s }))
              ]}
            />

            {/* Timeframe Date Filter Dropdown */}
            <FilterSelect
              label="Timeframe"
              value={selectedTimeframe}
              onChange={setSelectedTimeframe}
              options={[
                { label: "All", value: "all" },
                { label: "Today", value: "today" },
                { label: "This Week", value: "week" },
              ]}
            />

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
          <div className="flex justify-between items-center pt-2.5 border-t border-sky-100/50 dark:border-gray-800/50 text-xs">
            <span className="font-semibold text-gray-500 dark:text-gray-400">
              Showing {filterTasks.length} of {tasks.length} issues
            </span>

            <div className="flex bg-sky-50 dark:bg-gray-800 p-1 rounded-lg border border-sky-100/50 dark:border-gray-700">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-700 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-100 dark:border-gray-600 font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:text-sky-700 dark:hover:text-sky-300"
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
                    : "text-gray-600 dark:text-gray-400 hover:text-sky-700 dark:hover:text-sky-300"
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
              columns={statuses}
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
                    {selectedStatus === "all"
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
                <>
                  {paginatedTasks.map((task) => (
                    <TaskItem
                      key={task._id || task.id}
                      task={task}
                      onRefresh={() => {
                        refreshTasks();
                        fetchPaginatedListTasks(1, false);
                      }}
                      showCompleteCheckbox
                    />
                  ))}
                  {currentPage < totalPages && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => fetchPaginatedListTasks(currentPage + 1, true)}
                        disabled={loadingList}
                        className="px-6 py-2 border-2 border-sky-100 dark:border-gray-800 text-sky-600 dark:text-sky-400 font-bold rounded-xl text-xs hover:bg-sky-50 dark:hover:bg-gray-800 hover:border-sky-300 dark:hover:border-gray-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        {loadingList ? "Loading..." : `Load More Tasks (${totalTasksCount - paginatedTasks.length} remaining)`}
                      </button>
                    </div>
                  )}
                </>
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
          <span className=" text-gray-605 dark:text-gray-300 font-medium">Add New Task</span>
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
        statuses={statuses}
      />
    </div>
  );
};

export default Dashboard;
