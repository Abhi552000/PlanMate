import React, { createContext, useContext, useEffect, useState } from "react";
import { IUser } from "../types";

interface AuthContextType {
  currentUser: IUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  login: (data: any, navigate: (path: string, options?: any) => void) => void;
  logout: (navigate: (path: string, options?: any) => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    setCurrentUser(user);
    const targetPath = user.role === "system_admin" ? "/system-admin" : "/";
    navigate(targetPath, { replace: true });
  };

  const logout = (navigate: (path: string, options?: any) => void) => {
    localStorage.removeItem("token");
    setCurrentUser(null);
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
