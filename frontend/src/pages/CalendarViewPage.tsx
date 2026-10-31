import React, { useState, useMemo, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Clock,
  Inbox,
} from "lucide-react";
import { ITask, DashboardContext } from "../types";
import TaskModal from "../components/TaskModal";
import { orgService } from "../services/orgService";
import { priorityStyles } from "../assets/dummy";
import { CALENDAR_TEXTS } from "../constants/uiTexts";
import { isSameDay, generateCalendarDays } from "../utils";
import { getCachedStatuses, setCachedStatuses } from "../utils/statusUtils";
import { CONSOLE_ERRORS, TOAST_MESSAGES } from "../constants/messages";

export const CalendarViewPage: React.FC = () => {
  const { tasks, refreshTasks, loading } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();

  // Calendar Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statuses, setStatuses] = useState<string[]>(getCachedStatuses);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch Custom Statuses from Org context
  useEffect(() => {
    let isMounted = true;
    const fetchOrgDetails = async () => {
      try {
        const data = await orgService.getOrgDetails();
        if (isMounted && data?.success && Array.isArray(data?.organization?.statuses) && data.organization.statuses.length > 0) {
          setCachedStatuses(data.organization.statuses);
          setStatuses(data.organization.statuses);
        }
      } catch (err) {
        console.error(CONSOLE_ERRORS.CALENDAR_LOAD_STATUSES, err);
      }
    };
    fetchOrgDetails();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate day array from global utilities
  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const isTodayDate = (d: Date) => {
    return isSameDay(d, new Date());
  };

  // Group tasks by scheduled vs unscheduled
  const { scheduledTasks, unscheduledTasks } = useMemo(() => {
    const scheduled: ITask[] = [];
    const unscheduled: ITask[] = [];

    const safeTasks = tasks || [];
    safeTasks.forEach((t) => {
      if (t.dueDate) {
        scheduled.push(t);
      } else {
        unscheduled.push(t);
      }
    });

    return { scheduledTasks: scheduled, unscheduledTasks: unscheduled };
  }, [tasks]);

  // Open modal in Create Mode with due date pre-filled
  const handleOpenCreateForDate = (date: Date) => {
    const formattedDate = date.toISOString().split("T")[0];
    setSelectedTask({ dueDate: formattedDate });
    setShowModal(true);
  };

  const handleOpenTask = (task: ITask) => {
    navigate(`/task/${task._id}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
    refreshTasks();
  };

  // Selected date state for Daily Agenda (essential for mobile responsiveness)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMobileAgendaModal, setShowMobileAgendaModal] = useState(false);

  const selectedDateTasks = useMemo(() => {
    return scheduledTasks.filter((t) =>
      isSameDay(new Date(t.dueDate!), selectedDate)
    );
  }, [scheduledTasks, selectedDate]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    if (window.innerWidth < 768) {
      setShowMobileAgendaModal(true);
    }
  };

  if (loading && (!tasks || tasks.length === 0)) {
    return (
      <div className="w-full flex flex-col xl:flex-row gap-6 font-sans select-none animate-pulse">
        <div className="flex-1 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl shadow-sm p-4 md:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-6 w-36 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-3.5 w-56 rounded bg-slate-100 dark:bg-slate-800/60" />
              </div>
            </div>
            <div className="h-9 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-slate-200 dark:border-gray-800">
            {CALENDAR_TEXTS.WEEKDAY_NAMES.map((name) => (
              <div key={name} className="bg-slate-50 dark:bg-gray-900 py-3 text-center text-xs font-semibold text-gray-400">
                {name}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-900 min-h-[4.5rem] md:min-h-[7rem] p-2 flex flex-col justify-between">
                <div className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="w-full xl:w-80 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
          <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 w-full rounded-xl bg-slate-100 dark:bg-slate-800/60" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full animate-fadeIn min-h-[calc(100vh-8rem)]">
      {/* Calendar Grid Container */}
      <div className="flex-1 bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl shadow-sm p-4 md:p-6 transition-all duration-300">
        {/* Calendar Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">
              Calendar View
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
              Visualize and schedule deadlines dynamically
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 dark:bg-gray-880 dark:hover:bg-gray-700 text-sky-700 dark:text-sky-300 rounded-lg text-xs font-semibold shadow-sm transition"
            >
              Today
            </button>
            <div className="flex items-center bg-sky-50/50 dark:bg-gray-800 rounded-lg p-0.5 border border-sky-100 dark:border-gray-750">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-200 min-w-[7.5rem] text-center">
                {CALENDAR_TEXTS.MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid Sheet */}
        <div className="overflow-x-auto scrollbar-thin rounded-xl">
          <div className="grid grid-cols-7 gap-px bg-sky-100 dark:bg-gray-850 min-w-[340px] sm:min-w-0 border border-sky-100 dark:border-gray-800">
          {/* Weekdays Row */}
          {CALENDAR_TEXTS.WEEKDAY_NAMES.map((name) => (
            <div
              key={name}
              className="bg-sky-50/70 dark:bg-gray-800/80 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400"
            >
              {name}
            </div>
          ))}

          {/* Days Grid Cells */}
          {calendarDays.map((dayCell, idx) => {
            const dateTasks = scheduledTasks.filter((t) =>
              isSameDay(new Date(t.dueDate!), dayCell.date)
            );
            const isSelected = isSameDay(dayCell.date, selectedDate);

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(dayCell.date)}
                className={`bg-white dark:bg-gray-900 min-h-[4.5rem] md:min-h-[8rem] p-1.5 md:p-2 flex flex-col group relative border-t border-sky-50 dark:border-gray-850 transition hover:bg-sky-50/10 dark:hover:bg-gray-850/10 cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-sky-500 dark:ring-sky-400 z-10"
                    : ""
                }`}
              >
                {/* Header Date Cell Label */}
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ${
                      isTodayDate(dayCell.date)
                        ? "bg-sky-500 text-white shadow-sm"
                        : dayCell.isCurrentMonth
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    {dayCell.date.getDate()}
                  </span>

                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCreateForDate(dayCell.date);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-sky-100 dark:hover:bg-gray-800 text-sky-600 dark:text-sky-400 rounded transition duration-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Day Tasks List */}
                <div className="flex-1 space-y-1 overflow-y-auto max-h-[5.5rem] scrollbar-thin">
                  {/* Desktop View Tasks (shows titles) */}
                  <div className="hidden md:block space-y-1">
                    {dateTasks.slice(0, 3).map((task) => {
                      const isCompleted = task.completed;
                      const priority = task.priority || "Low";
                      const isOverdue =
                        !isCompleted &&
                        new Date(task.dueDate!).getTime() <
                          new Date().setHours(0, 0, 0, 0);

                      // Map priorities to CSS classes
                      const priorityClasses =
                        priorityStyles[priority] ||
                        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

                      return (
                        <div
                          key={task._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTask(task);
                          }}
                          className={`px-1.5 py-1 text-[10px] md:text-xs rounded border shadow-sm cursor-pointer flex items-center gap-1 transition-all truncate hover:brightness-95 dark:hover:brightness-110 ${priorityClasses} ${
                            isCompleted ? "opacity-60 line-through" : ""
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
                          ) : isOverdue ? (
                            <Clock className="w-3 h-3 text-red-500 shrink-0" />
                          ) : null}
                          <span className="font-semibold shrink-0">
                            {task.key || `PM-${task._id.slice(-4).toUpperCase()}`}
                            :
                          </span>
                          <span className="truncate">{task.title}</span>
                        </div>
                      );
                    })}

                    {dateTasks.length > 3 && (
                      <div className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 text-center py-0.5">
                        + {dateTasks.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Mobile View Tasks (shows colored indicator dots) */}
                  <div className="flex md:hidden flex-wrap gap-1 justify-center items-center mt-1">
                    {dateTasks.slice(0, 4).map((task) => {
                      const priority = task.priority || "Low";
                      let dotColor = "bg-emerald-500";
                      if (priority === "Medium") dotColor = "bg-amber-500";
                      if (priority === "High") dotColor = "bg-rose-500";
                      if (task.completed) dotColor = "bg-green-500/40 dark:bg-green-500/20";

                      return (
                        <span
                          key={task._id}
                          className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                          title={task.title}
                        />
                      );
                    })}
                    {dateTasks.length > 4 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>

      {/* Side Panels - Unscheduled & Daily Agenda */}
      <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
        {/* Daily Agenda Panel (ClickUp style) */}
        <div className="w-full bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl shadow-sm p-4 flex flex-col transition-all duration-300">
          <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-sky-100 dark:bg-sky-900/50 rounded-lg text-sky-600 dark:text-sky-400">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  Daily Agenda
                </h2>
                <p className="text-[10px] text-gray-500">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenCreateForDate(selectedDate)}
              className="p-1 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-lg text-sky-600 dark:text-sky-400 transition"
              title="Add task for this day"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[15rem] xl:max-h-[18rem] scrollbar-thin">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-600">
                No tasks scheduled for this day.
              </div>
            ) : (
              selectedDateTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => handleOpenTask(task)}
                  className={`p-2.5 border rounded-xl cursor-pointer transition-all duration-205 flex flex-col gap-1.5 shadow-sm group ${
                    task.completed
                      ? "bg-gray-50/50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-800 opacity-70"
                      : "bg-sky-50/10 border-sky-50 hover:bg-sky-50/30 dark:bg-gray-850 dark:border-gray-800/80 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                      {task.key || `PM-${task._id.slice(-4).toUpperCase()}`}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 font-semibold border ${
                        priorityStyles[task.priority || "Low"]
                      }`}
                    >
                      {task.priority || "Low"}
                    </span>
                  </div>
                  <h3
                    className={`text-xs font-semibold text-gray-800 dark:text-gray-300 group-hover:text-sky-600 transition truncate ${
                      task.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </h3>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Unscheduled Tasks Panel */}
        <div className="w-full bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl shadow-sm p-4 flex flex-col transition-all duration-300">
          <div className="flex items-center gap-2 border-b border-sky-50 dark:border-gray-800 pb-3 mb-4">
            <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg text-yellow-600 dark:bg-yellow-400">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Unscheduled Tasks
              </h2>
              <p className="text-[10px] text-gray-550">
                Inbox ({unscheduledTasks.length})
              </p>
            </div>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[15rem] xl:max-h-[18rem] scrollbar-thin">
            {unscheduledTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 dark:text-gray-600">
                All tasks have deadlines!
              </div>
            ) : (
              unscheduledTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => handleOpenTask(task)}
                  className="p-2.5 border border-sky-50 dark:border-gray-800/80 rounded-xl bg-sky-50/10 hover:bg-sky-50/30 dark:bg-gray-850 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 flex flex-col gap-1.5 shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                      {task.key || `PM-${task._id.slice(-4).toUpperCase()}`}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 font-semibold border ${
                        priorityStyles[task.priority || "Low"]
                      }`}
                    >
                      {task.priority || "Low"}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-300 group-hover:text-sky-600 transition truncate">
                    {task.title}
                  </h3>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Agenda Modal */}
      {showMobileAgendaModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowMobileAgendaModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl shadow-xl p-5 w-full max-w-sm max-h-[75vh] flex flex-col animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-100 dark:bg-sky-900/50 rounded-lg text-sky-600 dark:text-sky-400">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    Daily Agenda
                  </h2>
                  <p className="text-[10px] text-gray-500">
                    {selectedDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setShowMobileAgendaModal(false);
                    handleOpenCreateForDate(selectedDate);
                  }}
                  className="p-1.5 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-lg text-sky-600 dark:text-sky-400 transition"
                  title="Add task for this day"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowMobileAgendaModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-305 p-1 rounded-lg transition"
                >
                  <span className="text-xl font-bold leading-none">&times;</span>
                </button>
              </div>
            </div>

            {/* Modal List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-500 dark:text-gray-600">
                  No tasks scheduled for this day.
                </div>
              ) : (
                selectedDateTasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => {
                      setShowMobileAgendaModal(false);
                      handleOpenTask(task);
                    }}
                    className={`p-2.5 border rounded-xl cursor-pointer transition-all duration-200 flex flex-col gap-1.5 shadow-sm group ${
                      task.completed
                        ? "bg-gray-50/50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-800 opacity-70"
                        : "bg-sky-50/10 border-sky-50 hover:bg-sky-50/30 dark:bg-gray-850 dark:border-gray-800/80 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
                        {task.key || `PM-${task._id.slice(-4).toUpperCase()}`}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 font-semibold border ${
                          priorityStyles[task.priority || "Low"]
                        }`}
                      >
                        {task.priority || "Low"}
                      </span>
                    </div>
                    <h3
                      className={`text-xs font-semibold text-gray-850 dark:text-gray-200 group-hover:text-sky-600 transition truncate ${
                        task.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Creation & Edit Modal */}
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
