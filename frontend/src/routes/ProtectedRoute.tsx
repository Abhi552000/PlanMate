import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { ROUTES } from "../constants/routeConstant";

export const ProtectedRoute: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (currentUser.role === "system_admin") {
    return <Navigate to={ROUTES.SYSTEM_ADMIN} replace />;
  }

  return (
    <Layout user={currentUser} onLogout={() => logout(navigate)} />
  );
};
export default ProtectedRoute;
