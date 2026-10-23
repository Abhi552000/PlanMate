import React, { useCallback, useMemo, useState, useEffect } from "react";
import { WRAPPER } from "../../assets/dummy";
import { useOutletContext, useSearchParams } from "react-router-dom";
import TaskModal from "../../components/TaskModal";
import KanbanBoard from "../../components/KanbanBoard";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardFilters } from "./components/DashboardFilters";
import { ListModeView } from "./components/ListModeView";
import { taskService } from "../../services/taskService";
import { orgService } from "../../services/orgService";
import { ITask, IUser, DashboardContext } from "../../types";
import { CONSOLE_ERRORS } from "../../constants/messages";
import { filterDashboardTasks } from "./helpers/dashboardHelpers";

const AnalyticsDashboard = React.lazy(() =>
  import("../../components/AnalyticsDashboard").then((m) => ({
    default: m.AnalyticsDashboard,
  }))
);

const Dashboard = () => {
  const { tasks, refreshTasks, viewMode, setViewMode } = useOutletContext<DashboardContext>();
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const assigneeParam = searchParams.get("assignee");
    const statusParam = searchParams.get("status");
    if (assigneeParam) {
      setSelectedAssignee(assigneeParam);
    }
    if (statusParam) {
      setSelectedStatus(statusParam);
    }
  }, [searchParams]);

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
        search: debouncedSearch,
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
      console.error(CONSOLE_ERRORS.FETCH_PAGINATED_TASKS, err);
    } finally {
      setLoadingList(false);
    }
  }, [debouncedSearch, selectedAssignee, selectedPriority, selectedStatus, selectedTimeframe]);

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
        console.error(CONSOLE_ERRORS.FETCH_MEMBERS_DASHBOARD, err);
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
        console.error(CONSOLE_ERRORS.FETCH_ORG_DETAILS, err);
      }
    };
    fetchOrgDetails();
  }, []);

  // Filter tasks dynamically for the Board view
  const filterTasks = useMemo(() => {
    return filterDashboardTasks(tasks, {
      searchQuery: debouncedSearch,
      selectedAssignee,
      selectedPriority,
      selectedStatus,
      selectedTimeframe,
    });
  }, [tasks, debouncedSearch, selectedAssignee, selectedPriority, selectedStatus, selectedTimeframe]);

  const stats = useMemo(() => {
    let low = 0;
    let med = 0;
    let high = 0;
    for (let i = 0; i < tasks.length; i++) {
      const p = tasks[i].priority;
      if (p === "Low") low++;
      else if (p === "Medium") med++;
      else if (p === "High") high++;
    }
    return {
      total: tasks.length,
      lowPriority: low,
      mediumPriority: med,
      highPriority: high,
    };
  }, [tasks]);

  const handleAddTask = useCallback(() => {
    setSelectedTask(null);
    setShowModal(true);
  }, []);

  const handleEditTask = useCallback((task: ITask) => {
    setSelectedTask(task);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedTask(null);
    refreshTasks();
    if (viewMode === "list") fetchPaginatedListTasks(1, false);
  }, [refreshTasks, viewMode, fetchPaginatedListTasks]);

  const handleListRefresh = useCallback(() => {
    refreshTasks();
    fetchPaginatedListTasks(1, false);
  }, [refreshTasks, fetchPaginatedListTasks]);

  return (
    <div className={WRAPPER}>
      <DashboardHeader
        totalTasks={stats.total}
        lowPriority={stats.lowPriority}
        mediumPriority={stats.mediumPriority}
        highPriority={stats.highPriority}
        onAddTask={handleAddTask}
      />

      <div className=" space-y-6">
        <DashboardFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedAssignee={selectedAssignee}
          setSelectedAssignee={setSelectedAssignee}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedTimeframe={selectedTimeframe}
          setSelectedTimeframe={setSelectedTimeframe}
          members={members}
          statuses={statuses}
          filterTasksCount={filterTasks.length}
          totalTasksCount={tasks.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <div>
          {viewMode === "kanban" ? (
            <KanbanBoard
              tasks={filterTasks}
              onRefresh={refreshTasks}
              onEdit={handleEditTask}
              onLogout={refreshTasks}
              columns={statuses}
            />
          ) : viewMode === "analytics" ? (
            <React.Suspense
              fallback={
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-2xl border border-sky-100 dark:border-gray-800">
                  <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                  <span className="text-xs text-gray-400 mt-2 font-medium">Loading analytics...</span>
                </div>
              }
            >
              <AnalyticsDashboard
                tasks={filterTasks}
                onApplyFilters={(filters) => {
                  const nextAssignee = filters.assignee !== undefined ? filters.assignee : selectedAssignee;
                  const nextPriority = filters.priority !== undefined ? filters.priority : selectedPriority;
                  const nextStatus = filters.status !== undefined ? filters.status : selectedStatus;
                  const nextTimeframe = filters.timeframe !== undefined ? filters.timeframe : selectedTimeframe;

                  setSearchQuery("");
                  setSelectedAssignee(nextAssignee);
                  setSelectedPriority(nextPriority);
                  setSelectedStatus(nextStatus);
                  setSelectedTimeframe(nextTimeframe);

                  setLoadingList(true);
                  const params = new URLSearchParams({
                    page: "1",
                    limit: "10",
                    search: "",
                    assignee: nextAssignee,
                    priority: nextPriority,
                    status: nextStatus,
                    timeframe: nextTimeframe
                  });
                  taskService.getTasks(params)
                    .then((data) => {
                      if (data?.success && data?.tasks) {
                        setPaginatedTasks(data.tasks);
                        setCurrentPage(data.pagination.currentPage);
                        setTotalPages(data.pagination.totalPages);
                        setTotalTasksCount(data.pagination.totalCount);
                      }
                    })
                    .catch((err) => console.error("Error direct fetching list tasks:", err))
                    .finally(() => setLoadingList(false));

                  setViewMode("list");
                }}
              />
            </React.Suspense>
          ) : (
            <ListModeView
              paginatedTasks={paginatedTasks}
              currentPage={currentPage}
              totalPages={totalPages}
              totalTasksCount={totalTasksCount}
              loadingList={loadingList}
              selectedStatus={selectedStatus}
              statuses={statuses}
              onAddTask={handleAddTask}
              onRefresh={handleListRefresh}
              onLoadMore={(page) => fetchPaginatedListTasks(page, true)}
            />
          )}
        </div>
      </div>

      {showModal && (
        <TaskModal
          isOpen={showModal}
          onClose={handleCloseModal}
          taskToEdit={selectedTask}
          statuses={statuses}
        />
      )}
    </div>
  );
};

export default Dashboard;
