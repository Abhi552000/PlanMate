import React from "react";

export type SysAdminTab = "organizations" | "plans" | "payments";

export interface SysAdminSidebarProps {
  activeTab: SysAdminTab;
  onTabChange: (tab: SysAdminTab) => void;
  orgCount?: number;
  plansCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOnboardClick: () => void;
}

export interface SysAdminNavItem {
  id: SysAdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface SysAdminPlansViewProps {
  organizations?: any[];
  onOrgPlanUpdated?: () => void;
}

export interface TenantDetailModalProps {
  org: any;
  onClose: () => void;
  onResetPassword: (org: any) => void;
  onEdit: (org: any) => void;
  onToggleActive: (org: any) => void;
  onDelete: (org: any) => void;
}

export type TenantDetailDrawerProps = TenantDetailModalProps;

export interface PlanManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  org: any;
  result: any;
  loading: boolean;
  onConfirm: () => void;
  onCopy: () => void;
  copied: boolean;
}
