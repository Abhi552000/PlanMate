import React from "react";
import { IUser } from "./user";

export interface IOrganization {
  _id: string;
  name: string;
  description?: string;
  owner?: string;
  taskCounter?: number;
  taskCount?: number;
  memberCount?: number;
  createdAt?: string;
  statuses?: string[];
  isActive?: boolean;
  remark?: string;
  slug?: string;
  subscription?: IOrganizationSubscription;
  admin?: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface IPlan {
  _id?: string;
  planId: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  maxMembers: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  isActive?: boolean;
}

export interface IOrganizationSubscription {
  planId: string;
  planName: string;
  maxMembers: number;
  status: "active" | "cancelled" | "past_due";
  billingCycle: string;
  amountPaid: number;
  currency: string;
  paymentMethod: string;
  transactionId?: string;
  subscribedAt: string;
  validUntil: string | null;
}

export interface ISubscriptionMetrics {
  activeMembersCount: number;
  activeMembers?: number;
  totalMembersCount: number;
  maxMembers: number;
  remainingSeats: number;
  usagePercent: number;
  isQuotaExceeded: boolean;
}

export interface SystemMetrics {
  totalPlatformUsers: number;
  totalPlatformTasks: number;
  totalOrganizations: number;
  activeOrganizations: number;
  inactiveOrganizations: number;
  dbStatus: string;
  nodeEnv: string;
}

export interface ExtendedUser extends IUser {
  solvedTasks?: number;
  createdAt?: string;
  solvedTasksCount?: number;
}

export interface OrgListTableProps {
  organizations: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: "all" | "active" | "inactive";
  setStatusFilter: (val: "all" | "active" | "inactive") => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  tableLoading?: boolean;
  togglingStatus: boolean;
  onToggleActive: (org: any) => void;
  onEditClick: (org: any) => void;
  onDeleteClick: (org: any) => void;
  onResetPasswordClick?: (org: any) => void;
  onInspectClick?: (org: any) => void;
  onExportCSV?: () => void;
}

export interface SysAdminHeaderProps {
  user: any;
  onLogout: () => void;
  onToggleMobileMenu?: () => void;
}

export interface OnboardOrgModalProps {
  isOpen: boolean;
  onClose: () => void;
  newOrg: any;
  setNewOrg: React.Dispatch<React.SetStateAction<any>>;
  onboardedResult: any;
  onboardSubmit: (e: React.FormEvent) => void;
  onboarding: boolean;
  copied: boolean;
  onCopyPassword: () => void;
}

export interface EditOrgModalProps {
  editingOrg: any;
  onClose: () => void;
  editForm: any;
  setEditForm: React.Dispatch<React.SetStateAction<any>>;
  updating: boolean;
  onUpdateSubmit: (e: React.FormEvent) => void;
}

export interface DeactivateOrgModalProps {
  deactivatingOrg: any;
  onClose: () => void;
  deactivateRemark: string;
  setDeactivateRemark: (val: string) => void;
  togglingStatus: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export interface AccessRemarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remark: string) => void;
  title: string;
  description: string;
  loading?: boolean;
}

export interface OrgMembersTableProps {
  teamUsers: any[];
  currentUser: any;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  togglingStatus: boolean;
  onPageChange: (page: number) => void;
  onInspectUser: (user: any) => void;
  onUpdateUserStatusClick: (user: any, actionType: "activate" | "deactivate") => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  onResetFilters: () => void;
}

export interface OrgAdminHeaderProps {
  orgName: string;
  onOnboardClick: () => void;
}

export interface OnboardMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  newMember: any;
  setNewMember: React.Dispatch<React.SetStateAction<any>>;
  addingMember: boolean;
  onAddMember: (e: React.FormEvent) => void;
}

export interface InspectingUserModalProps {
  inspectingUser: any;
  onClose: () => void;
}

export interface SystemAdminDashboardProps {
  onLogout: () => void;
  user: IUser | null;
}
