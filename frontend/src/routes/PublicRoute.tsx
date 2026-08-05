import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routeConstant";

export const PublicRoute: React.FC = () => {
  const { currentUser } = useAuth();

  if (currentUser) {
    const target = currentUser.role === "system_admin" ? ROUTES.SYSTEM_ADMIN : ROUTES.DASHBOARD;
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};
