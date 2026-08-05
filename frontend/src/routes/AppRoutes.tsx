import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "../components/Login";
import Signup from "../components/Signup";
import Dashboard from "../pages/dashboard/Dashboard";
import Profile from "../pages/Profile";
import TaskDetailPage from "../pages/task-detail/TaskDetailPage";
import OrganizationAdmin from "../pages/org-admin/OrganizationAdmin";
import SystemAdminDashboard from "../pages/sys-admin/SystemAdminDashboard";
import WorkspaceSettings from "../pages/WorkspaceSettings";

import { PublicRoute } from "./PublicRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { SystemAdminRoute } from "./SystemAdminRoute";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routeConstant";

export const AppRoutes: React.FC = () => {
  const { login, logout, currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route
          path={ROUTES.LOGIN}
          element={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Login
                onSubmit={(data) => login(data, navigate)}
                onSwitchMode={() => navigate(ROUTES.SIGNUP)}
              />
            </div>
          }
        />
        <Route
          path={ROUTES.SIGNUP}
          element={
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Signup
                onSubmit={(data) => login(data, navigate)}
                onSwitchMode={() => navigate(ROUTES.LOGIN)}
              />
            </div>
          }
        />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.TASK_DETAIL} element={<TaskDetailPage />} />
        <Route path={ROUTES.ORGANIZATION} element={<OrganizationAdmin />} />
        <Route path={ROUTES.WORKSPACE_SETTINGS} element={<WorkspaceSettings />} />
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
  );
};

export default AppRoutes;
