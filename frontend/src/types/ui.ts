import React from "react";
import { IUser, ITask } from "./index";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  wrapperClassName?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  icon?: React.ReactNode;
  wrapperClassName?: string;
}

export interface LayoutProps {
  user: IUser | null;
  onLogout: () => void;
}

export interface SidebarProps {
  user: IUser | null;
  tasks?: ITask[];
  mobileOpen?: boolean;
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface NavbarProps {
  user?: Partial<IUser> | null;
  onLogout: () => void;
  onToggleMobileMenu?: () => void;
  hasSidebar?: boolean;
}
