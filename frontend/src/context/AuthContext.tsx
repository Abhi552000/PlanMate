import React, { createContext, useContext, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { loginSuccess, logoutSuccess } from "../store/slices/authSlice";
import { IUser, AuthContextType } from "../types";
import { authService } from "../services/authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const setCurrentUser = useCallback(
    (updater: any) => {
      if (typeof updater === "function") {
        const updatedUser = updater(currentUser);
        dispatch(loginSuccess(updatedUser));
      } else {
        dispatch(loginSuccess(updater));
      }
    },
    [dispatch, currentUser]
  );

  const refreshUser = useCallback(async (): Promise<IUser | null> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const data = await authService.getMe();
      if (data?.success && data?.user) {
        const u = data.user;
        const updatedUser: IUser = {
          _id: u.id || u._id || "",
          email: u.email,
          name: u.name || "User",
          role: u.role || "member",
          status: u.status || "active",
          organization: u.organization || null,
          organizationName:
            u.organization && typeof u.organization === "object"
              ? u.organization.name
              : u.organizationName || "",
          isSubscriptionExpired: Boolean(u.isSubscriptionExpired),
          avatar:
            currentUser?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              u.name || "User"
            )}&background=random`,
        };
        dispatch(loginSuccess(updatedUser));
        return updatedUser;
      }
    } catch (err) {
      console.error("Failed to refresh user session:", err);
    }
    return null;
  }, [dispatch]);

  const login = useCallback(
    (data: any, navigate: (path: string, options?: any) => void) => {
      const user: IUser = {
        _id: data.id || data._id || "",
        email: data.email,
        name: data.name || "User",
        role: data.role || "member",
        status: data.status || "active",
        organization: data.organization || null,
        isSubscriptionExpired: Boolean(data.isSubscriptionExpired),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          data.name || "User"
        )}&background=random`,
      };
      dispatch(loginSuccess(user));
      const targetPath = user.role === "system_admin" ? "/system-admin" : "/";
      navigate(targetPath, { replace: true });
    },
    [dispatch]
  );

  const logout = useCallback(
    (navigate: (path: string, options?: any) => void) => {
      dispatch(logoutSuccess());
      navigate("/login", { replace: true });
    },
    [dispatch]
  );

  const contextValue = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      refreshUser,
      login,
      logout,
    }),
    [currentUser, setCurrentUser, refreshUser, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
