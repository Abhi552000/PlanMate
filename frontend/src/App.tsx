import React, { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import TaskDetailPage from "./pages/TaskDetailPage";
import OrganizationAdmin from "./pages/OrganizationAdmin";
import SystemAdminDashboard from "./pages/SystemAdminDashboard";
import WorkspaceSettings from "./pages/WorkspaceSettings";
import { ToastContainer } from "react-toastify";
import { IUser } from "./types";

const App = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<IUser | null>(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  const handleAuthSubmit = (data: any) => {
    console.log("data", data);
    const user: IUser = {
      _id: data.id || data._id || "",
      email: data.email,
      name: data.name || "User",
      role: data.role || "member",
      status: data.status || "active",
      organization: data.organization || null,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        data.name || "User"
      )}&background=random`,
    };
    setCurrentUser(user);
    
    // Redirect role-specific routes immediately
    const targetPath = user.role === "system_admin" ? "/system-admin" : "/";
    navigate(targetPath, { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    navigate("/login", { replace: true });
  };

  const ProtectedLayout = () => {
    if (currentUser?.role === "system_admin") {
      return <Navigate to="/system-admin" replace />;
    }
    return (
      <Layout user={currentUser} onLogout={handleLogout} />
    );
  };

  const SystemAdminLayout = () => {
    if (!currentUser) return <Navigate to="/login" replace />;
    if (currentUser.role !== "system_admin") return <Navigate to="/" replace />;
    return <Outlet />;
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route
          path="/login"
          element={
            <div className=" fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Login
                onSubmit={handleAuthSubmit}
                onSwitchMode={() => navigate("/signup")}
              />
            </div>
          }
        />
        <Route
          path="/signup"
          element={
            <div className=" fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Signup
                onSubmit={handleAuthSubmit}
                onSwitchMode={() => navigate("/login")}
              />
            </div>
          }
        />

        <Route
          element={
            currentUser ? <ProtectedLayout /> : <Navigate to="/login" replace />
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/task/:id" element={<TaskDetailPage />} />
          <Route path="/organization" element={<OrganizationAdmin />} />
          <Route path="/workspace-settings" element={<WorkspaceSettings />} />
          <Route
            path="/profile"
            element={
              <Profile
                user={currentUser}
                setCurrentUser={setCurrentUser}
                onLogout={handleLogout}
              />
            }
          />
        </Route>

        <Route element={<SystemAdminLayout />}>
          <Route path="/system-admin" element={<SystemAdminDashboard onLogout={handleLogout} user={currentUser} />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={currentUser ? "/" : "/login"} replace />}
        />
      </Routes>
    </>
  );
};

export default App;
