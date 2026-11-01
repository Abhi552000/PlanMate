import React from "react";
import { IUser } from "./user";

export interface AuthContextType {
  currentUser: IUser | null;
  setCurrentUser: (updater: any) => void;
  refreshUser: () => Promise<IUser | null>;
  login: (data: any, navigate: (path: string, options?: any) => void) => void;
  logout: (navigate: (path: string, options?: any) => void) => void;
}

export interface AuthState {
  currentUser: IUser | null;
  loading: boolean;
  error: string | null;
}

export interface LoginProps {
  onSubmit: (user: any) => void;
  onSwitchMode: () => void;
}

export interface Organization {
  _id: string;
  name: string;
}

export interface SignupProps {
  onSubmit: (user: any) => void;
  onSwitchMode: () => void;
}

export interface ProfileProps {
  user: IUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  onLogout: () => void;
}
