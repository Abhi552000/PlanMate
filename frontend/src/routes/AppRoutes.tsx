import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";

const TicketRedirectHandler: React.FC = () => {
  const { ticketKey } = useParams<{ ticketKey: string }>();

  if (ticketKey) {
    // Check if subtask format: e.g. PM-104-2
    const subtaskMatch = ticketKey.match(/^([A-Za-z0-9]+-\d+)-(\d+)$/i);
    if (subtaskMatch) {
      const parentKey = subtaskMatch[1];
      const subtaskIdx = Math.max(0, parseInt(subtaskMatch[2], 10) - 1);
      return <Navigate to={`/task/${parentKey}?subtask=${subtaskIdx}`} replace />;
    }

    // Check if standard parent ticket key format: e.g. PM-104 or TASK-12
    if (/^[A-Za-z0-9]+-\d+$/i.test(ticketKey)) {
      return <Navigate to={`/task/${ticketKey}`} replace />;
    }
  }

  return <Navigate to={ROUTES.DASHBOARD} replace />;
};

const Login = lazy(() => import("../components/Login"));
const Signup = lazy(() => import("../components/Signup"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const Profile = lazy(() => import("../pages/Profile"));
const TaskDetailPage = lazy(() => import("../pages/task-detail/TaskDetailPage"));
const OrganizationAdmin = lazy(() => import("../pages/org-admin/OrganizationAdmin"));
const PlansBillingPage = lazy(() => import("../pages/org-admin/PlansBillingPage"));
const SystemAdminDashboard = lazy(() => import("../pages/sys-admin/SystemAdminDashboard"));
const WorkspaceSettings = lazy(() => import("../pages/WorkspaceSettings"));
const Backlog = lazy(() => import("../pages/dashboard/Backlog"));
const ActiveSprint = lazy(() => import("../pages/dashboard/ActiveSprint"));
const CalendarViewPage = lazy(() =>
  import("../pages/CalendarViewPage").then((m) => ({ default: m.CalendarViewPage }))
);
const ReportsPage = lazy(() => import("../pages/reports/ReportsPage"));

import { PublicRoute } from "./PublicRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { SystemAdminRoute } from "./SystemAdminRoute";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routeConstant";

const RouteLoadingFallback = () => (
  <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8">
    <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
    <span className="mt-3 text-xs font-semibold text-gray-400 tracking-wide uppercase">
      Loading...
    </span>
  </div>
);

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed inset-0 w-full h-full min-h-screen bg-slate-900 dark:bg-slate-950 flex items-center justify-center p-4 overflow-y-auto z-50">
    <div className="relative z-10 w-full flex items-center justify-center my-auto">
      {children}
    </div>
  </div>
);

export const AppRoutes: React.FC = () => {
  const { login, logout, currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route
          path={ROUTES.LOGIN}
          element={
            <AuthWrapper>
              <Login
                onSubmit={(data) => login(data, navigate)}
                onSwitchMode={() => navigate(ROUTES.SIGNUP)}
              />
            </AuthWrapper>
          }
        />
        <Route
          path={ROUTES.SIGNUP}
          element={
            <AuthWrapper>
              <Signup
                onSubmit={(data) => login(data, navigate)}
                onSwitchMode={() => navigate(ROUTES.LOGIN)}
              />
            </AuthWrapper>
          }
        />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.TASK_DETAIL} element={<TaskDetailPage />} />
        <Route path={ROUTES.ORGANIZATION} element={<OrganizationAdmin />} />
        <Route path={ROUTES.SUBSCRIPTION} element={<PlansBillingPage />} />
        <Route path={ROUTES.WORKSPACE_SETTINGS} element={<WorkspaceSettings />} />
        <Route path={ROUTES.BACKLOG} element={<Backlog />} />
        <Route path={ROUTES.ACTIVE_SPRINT} element={<ActiveSprint />} />
        <Route path={ROUTES.CALENDAR} element={<CalendarViewPage />} />
        <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
        <Route
          path={ROUTES.PROFILE}
          element={
            <Profile
              user={currentUser}
              setCurrentUser={setCurrentUser}
              onLogout={() => logout(navigate)}
            />
          }
        />
        <Route path="/browse/:id" element={<TaskDetailPage />} />
        <Route path="/:ticketKey" element={<TicketRedirectHandler />} />
      </Route>

      {/* System Admin Routes */}
      <Route element={<SystemAdminRoute />}>
        <Route
          path={ROUTES.SYSTEM_ADMIN}
          element={
            <SystemAdminDashboard
              onLogout={() => logout(navigate)}
              user={currentUser}
            />
          }
        />
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to={currentUser ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />}
      />
    </Routes>
    </Suspense>
  );
};

export default AppRoutes;
