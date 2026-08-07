import React, { createContext, useContext } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { loginSuccess, logoutSuccess } from "../store/slices/authSlice";
import { IUser } from "../types";

interface AuthContextType {
  currentUser: IUser | null;
  setCurrentUser: (updater: any) => void;
  login: (data: any, navigate: (path: string, options?: any) => void) => void;
  logout: (navigate: (path: string, options?: any) => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const setCurrentUser = (updater: any) => {
    if (typeof updater === "function") {
      const updatedUser = updater(currentUser);
      dispatch(loginSuccess(updatedUser));
    } else {
      dispatch(loginSuccess(updater));
    }
  };

  const login = (data: any, navigate: (path: string, options?: any) => void) => {
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
    dispatch(loginSuccess(user));
    const targetPath = user.role === "system_admin" ? "/system-admin" : "/";
    navigate(targetPath, { replace: true });
  };

  const logout = (navigate: (path: string, options?: any) => void) => {
    dispatch(logoutSuccess());
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, login, logout }}>
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
