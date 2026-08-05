import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routeConstant";

export const SystemAdminRoute: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (currentUser.role !== "system_admin") {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};
export default SystemAdminRoute;
