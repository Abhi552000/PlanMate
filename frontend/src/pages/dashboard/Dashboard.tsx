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
import { ITask, IUser } from "../../types";

interface DashboardContext {
  tasks: ITask[];
  refreshTasks: (silent?: boolean) => void;
  viewMode: string;
  setViewMode: (val: string) => void;
}

const Dashboard = () => {
  const { tasks, refreshTasks, viewMode, setViewMode } = useOutletContext<DashboardContext>();
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");

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
        console.error("Error fetching org details:", err);
      }
    };
    fetchOrgDetails();
  }, []);

  // Filter tasks dynamically for the Board view
  const filterTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query) || false;
        const matchesKey = task.key?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDesc && !matchesKey) return false;
      }
      // 2. Assignee
      if (selectedAssignee !== "all") {
        if (selectedAssignee === "unassigned") {
          if (task.assignee) return false;
        } else {
          const assigneeId = task.assignee?._id || task.assignee;
          if (assigneeId !== selectedAssignee) return false;
        }
      }
      // 3. Priority
      if (selectedPriority !== "all" && task.priority !== selectedPriority) return false;
      // 4. Status
      if (selectedStatus !== "all") {
        if (selectedStatus === "pending") {
          if (task.status === "Done") return false;
        } else {
          if (task.status !== selectedStatus) return false;
        }
      }
      // 5. Timeframe
      if (selectedTimeframe !== "all" && task.dueDate) {
        const due = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        if (selectedTimeframe === "today") {
          if (due < today || due >= tomorrow) return false;
        } else if (selectedTimeframe === "week") {
          if (due < today || due > endOfWeek) return false;
        } else if (selectedTimeframe === "overdue") {
          if (due >= today || task.completed) return false;
        }
      }
      return true;
    });
  }, [tasks, searchQuery, selectedAssignee, selectedPriority, selectedStatus, selectedTimeframe]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      lowPriority: tasks.filter((t) => t.priority === "Low").length,
      mediumPriority: tasks.filter((t) => t.priority === "Medium").length,
      highPriority: tasks.filter((t) => t.priority === "High").length,
    };
  }, [tasks]);

  return (
    <div className={WRAPPER}>
      <DashboardHeader
        totalTasks={stats.total}
        lowPriority={stats.lowPriority}
        mediumPriority={stats.mediumPriority}
        highPriority={stats.highPriority}
        onAddTask={() => {
          setSelectedTask(null);
          setShowModal(true);
        }}
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
              onEdit={(task) => {
                setSelectedTask(task);
                setShowModal(true);
              }}
              onLogout={refreshTasks}
              columns={statuses}
            />
          ) : (
            <ListModeView
              paginatedTasks={paginatedTasks}
              currentPage={currentPage}
              totalPages={totalPages}
              totalTasksCount={totalTasksCount}
              loadingList={loadingList}
              selectedStatus={selectedStatus}
              statuses={statuses}
              onAddTask={() => {
                setSelectedTask(null);
                setShowModal(true);
              }}
              onRefresh={() => {
                refreshTasks();
                fetchPaginatedListTasks(1, false);
              }}
              onLoadMore={(page) => fetchPaginatedListTasks(page, true)}
            />
          )}
        </div>
      </div>

      {showModal && (
        <TaskModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedTask(null);
            refreshTasks();
            if (viewMode === "list") fetchPaginatedListTasks(1, false);
          }}
          taskToEdit={selectedTask}
          statuses={statuses}
        />
      )}
    </div>
  );
};

export default Dashboard;
