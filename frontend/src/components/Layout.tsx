import React, { useCallback, useEffect, useState, useMemo } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchTasks } from "../store/slices/taskSlice";
import { toast } from "react-toastify";
import { LayoutProps } from "../types";
import { isOrgSubscriptionExpired } from "../utils/subscriptionUtils";
import { SubscriptionExpiredModal } from "./common/SubscriptionExpiredModal";
import { ROUTES } from "../constants/routeConstant";
import { useAuth } from "../context/AuthContext";

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const dispatch = useAppDispatch();
  const { refreshUser } = useAuth();
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const loading = useAppSelector((state) => state.tasks.loading);
  const error = useAppSelector((state) => state.tasks.error);
  const [viewMode, setViewMode] = useState("kanban");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. Collapsible sidebar state (persisted across page reloads like Jira)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("planmate_sidebar_collapsed");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("planmate_sidebar_collapsed", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // 2. Jira keyboard shortcut: press "[" to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      if (e.key === "[") {
        e.preventDefault();
        handleToggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggleCollapse]);

  const location = useLocation();
  const navigate = useNavigate();
  const isExpired = isOrgSubscriptionExpired(user);

  // If a normal member's subscription is expired, gracefully log them out
  useEffect(() => {
    if (user && user.role === "member" && isExpired) {
      toast.warn(
        "Your organization subscription has expired. Please contact your workspace administrator to renew.",
        { toastId: "member-expired-session" }
      );
      onLogout?.();
    }
  }, [user, isExpired, onLogout]);

  // Operational paths blocked for Org Admin on expired subscription:
  // Only Plans & Billing (/subscription) and Profile (/profile) remain accessible
  const isAllowedExpiredPath =
    location.pathname === ROUTES.SUBSCRIPTION ||
    location.pathname === ROUTES.PROFILE;

  const showExpiredModal = Boolean(
    isExpired && user?.role === "org_admin" && !isAllowedExpiredPath
  );

  // If organization admin's session is marked expired, check if subscription was renewed
  useEffect(() => {
    if (user?.role === "org_admin" && isExpired) {
      refreshUser().then((refreshed) => {
        if (refreshed && !isOrgSubscriptionExpired(refreshed)) {
          dispatch(fetchTasks());
        }
      });
    }
  }, [location.pathname, isExpired, user?.role, refreshUser, dispatch]);

  // Handle custom subscription expired events dispatched by API interceptors
  useEffect(() => {
    const handleSubscriptionExpiredEvent = () => {
      refreshUser();
    };

    window.addEventListener("planmate:subscription_expired", handleSubscriptionExpiredEvent);
    return () => {
      window.removeEventListener("planmate:subscription_expired", handleSubscriptionExpiredEvent);
    };
  }, [refreshUser]);

  // Periodic and tab-focus check to detect live expiration if clock passes validity window
  useEffect(() => {
    if (!user || user.role === "system_admin") return;

    const checkLiveSubscription = () => {
      const expiredNow = isOrgSubscriptionExpired(user);
      if (expiredNow && !isExpired) {
        refreshUser();
      }
    };

    const interval = setInterval(checkLiveSubscription, 30000);
    window.addEventListener("focus", checkLiveSubscription);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkLiveSubscription);
    };
  }, [user, isExpired, refreshUser]);

  const fetchTasksData = useCallback(
    async (_silent = true) => {
      if (user?.role === "system_admin" || isExpired) return;
      dispatch(fetchTasks());
    },
    [dispatch, user?.role, isExpired]
  );

  const outletContext = useMemo(
    () => ({
      tasks,
      refreshTasks: fetchTasksData,
      viewMode,
      setViewMode,
      loading,
    }),
    [tasks, fetchTasksData, viewMode, loading]
  );

  useEffect(() => {
    fetchTasksData(false);
  }, [fetchTasksData]);

  const hasSidebar = Boolean(user && user.role !== "system_admin");

  useEffect(() => {
    if (error && !isExpired) {
      toast.error(error, { toastId: "sync-tasks-error" });
    }
  }, [error, isExpired]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar
        user={user || undefined}
        onLogout={onLogout}
        hasSidebar={hasSidebar}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />
      {hasSidebar && (
        <Sidebar
          user={user}
          tasks={tasks}
          mobileOpen={mobileMenuOpen}
          setMobileOpen={setMobileMenuOpen}
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
          onLogout={onLogout}
        />
      )}

      {showExpiredModal && (
        <SubscriptionExpiredModal
          planName={user?.organization?.subscription?.planName}
          onRenew={() => navigate(ROUTES.SUBSCRIPTION)}
          onManageAccount={() => navigate(ROUTES.PROFILE)}
        />
      )}

      <main
        className={`${
          hasSidebar ? (isCollapsed ? "pl-0 lg:pl-16" : "pl-0 lg:pl-60") : "pl-0"
        } transition-all duration-300 ease-in-out min-h-screen w-full overflow-x-hidden`}
      >
        <div className="px-3.5 sm:px-6 md:px-8 pt-3 sm:pt-5 pb-6 w-full transition-all duration-300 text-gray-900 dark:text-gray-100">
          <div className="w-full">
            <Outlet context={outletContext} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default React.memo(Layout);
