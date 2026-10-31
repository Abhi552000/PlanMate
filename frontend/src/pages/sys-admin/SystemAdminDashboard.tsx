import React, { useMemo, useState } from "react";
import {
  ShieldAlert,
  Plus,
  Building,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { SystemAdminDashboardProps } from "../../types";
import {
  ADD_BUTTON,
  HEADER,
  STAT_CARD,
  ICON_WRAPPER,
  LABEL_CLASS,
  VALUE_CLASS,
} from "../../assets/dummy";

// Sub-components
import { SysAdminHeader } from "./components/SysAdminHeader";
import { SysAdminSidebar, SysAdminTab } from "./components/SysAdminSidebar";
import { SysAdminPlansView } from "./components/SysAdminPlansView";
import { SysAdminPaymentsView } from "./components/SysAdminPaymentsView";
import { OrgListTable } from "./components/OrgListTable";
import { OnboardOrgModal } from "./components/OnboardOrgModal";
import { EditOrgModal } from "./components/EditOrgModal";
import { DeactivateOrgModal } from "./components/DeactivateOrgModal";
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import { TenantDetailDrawer } from "./components/TenantDetailDrawer";
import { PlanManagementModal } from "./components/PlanManagementModal";
import { useSystemAdmin } from "./hooks/useSystemAdmin";

const SystemAdminDashboard: React.FC<SystemAdminDashboardProps> = ({ onLogout, user }) => {
  const {
    organizations,
    systemMetrics,
    loading,
    showOnboardModal,
    setShowOnboardModal,
    newOrg,
    setNewOrg,
    onboardedResult,
    setOnboardedResult,
    copied,
    editingOrg,
    setEditingOrg,
    editForm,
    setEditForm,
    deactivatingOrg,
    setDeactivatingOrg,
    deactivateRemark,
    setDeactivateRemark,
    inspectingOrg,
    setInspectingOrg,
    resetPasswordOrg,
    setResetPasswordOrg,
    resetResult,
    setResetResult,
    resettingPassword,
    copiedReset,
    searchQuery,
    setSearchQuery,
    onboarding,
    updating,
    togglingStatus,
    error,
    setError,
    success,
    setSuccess,
    handleOnboardSubmit,
    handleEditClick,
    handleUpdate,
    handleToggleActive,
    submitDeactivation,
    handleDelete,
    handleCopyPassword,
    handleResetPassword,
    handleResetPasswordConfirm,
    handleCopyResetPassword,
    exportOrganizationsCSV,
  } = useSystemAdmin();

  // Super Admin Navigation Tab State
  const [activeTab, setActiveTab] = useState<SysAdminTab>("organizations");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);

  const stats = useMemo(() => {
    const total = organizations.length;
    const active = organizations.filter((o) => o.isActive).length;
    const inactive = total - active;
    const totalMembers =
      systemMetrics?.totalPlatformUsers !== undefined
        ? systemMetrics.totalPlatformUsers
        : organizations.reduce((acc, o) => acc + (o.memberCount || 0), 0);
    const totalTasks =
      systemMetrics?.totalPlatformTasks !== undefined
        ? systemMetrics.totalPlatformTasks
        : organizations.reduce(
            (acc, o) => acc + (o.taskCount || o.taskCounter || 0),
            0
          );

    return { total, active, inactive, totalMembers, totalTasks };
  }, [organizations, systemMetrics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <SysAdminHeader user={user} onLogout={onLogout} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-7 w-56 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-80 rounded bg-slate-100 dark:bg-slate-800/60" />
            </div>
            <div className="h-9 w-36 rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`${STAT_CARD} border-slate-200 dark:border-slate-800`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                    <div className="h-5 w-10 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      <SysAdminHeader user={user} onLogout={onLogout} />

      {/* SUPER ADMIN WORKSPACE LAYOUT WITH SIDEBAR */}
      <div className="flex-1 flex overflow-hidden">
        {/* Superadmin Sidebar Menu */}
        <SysAdminSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          onOnboardClick={() => {
            setShowOnboardModal(true);
            setOnboardedResult(null);
            setError(null);
            setSuccess(null);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {activeTab === "organizations" && (
            <>
              {/* HEADER SECTION */}
              <div className={HEADER}>
                <div className="min-w-0">
                  <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <ShieldAlert className="text-sky-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
                    <span className="truncate">Organizations Administration</span>
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7 truncate">
                    Manage tenant workspaces, representatives, resource utilization, and tenant credentials
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => {
                      setShowOnboardModal(true);
                      setOnboardedResult(null);
                      setError(null);
                      setSuccess(null);
                    }}
                    className={ADD_BUTTON}
                  >
                    <Plus size={18} />
                    Onboard Organization
                  </button>
                </div>
              </div>

              {/* STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className={`${STAT_CARD} border-sky-100 dark:border-gray-800 dark:bg-gray-900/60 backdrop-blur-sm`}>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className={`${ICON_WRAPPER} bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400`}>
                      <Building className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className={LABEL_CLASS}>Total Organizations</p>
                      <p className={VALUE_CLASS}>{stats.total}</p>
                    </div>
                  </div>
                </div>

                <div className={`${STAT_CARD} border-sky-100 dark:border-gray-800 dark:bg-gray-900/60 backdrop-blur-sm`}>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className={`${ICON_WRAPPER} bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400`}>
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className={LABEL_CLASS}>Active Tenants</p>
                      <p className={VALUE_CLASS}>{stats.active}</p>
                    </div>
                  </div>
                </div>

                <div className={`${STAT_CARD} border-sky-100 dark:border-gray-800 dark:bg-gray-900/60 backdrop-blur-sm`}>
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className={`${ICON_WRAPPER} bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400`}>
                      <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className={LABEL_CLASS}>Inactive Tenants</p>
                      <p className={VALUE_CLASS}>{stats.inactive}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* NOTIFICATIONS */}
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50 animate-fadeIn font-semibold">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 font-bold animate-fadeIn">
                  {success}
                </div>
              )}

              {/* ORGANIZATIONS DIRECTORY TABLE */}
              <OrgListTable
                organizations={organizations}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                togglingStatus={togglingStatus}
                onToggleActive={handleToggleActive}
                onEditClick={handleEditClick}
                onDeleteClick={handleDelete}
                onResetPasswordClick={handleResetPassword}
                onInspectClick={setInspectingOrg}
                onExportCSV={exportOrganizationsCSV}
              />
            </>
          )}

          {/* PLANS & PRICING CONFIGURATION VIEW */}
          {activeTab === "plans" && (
            <SysAdminPlansView />
          )}

          {/* PAYMENT HISTORY VIEW */}
          {activeTab === "payments" && (
            <SysAdminPaymentsView />
          )}
        </main>
      </div>

      {/* 1-Click Reset Password Confirmation Modal */}
      <ResetPasswordModal
        isOpen={Boolean(resetPasswordOrg)}
        onClose={() => {
          setResetPasswordOrg(null);
          setResetResult(null);
        }}
        org={resetPasswordOrg}
        result={resetResult}
        loading={resettingPassword}
        onConfirm={handleResetPasswordConfirm}
        onCopy={handleCopyResetPassword}
        copied={copiedReset}
      />

      {/* Tenant Detail & Workflows Drawer */}
      <TenantDetailDrawer
        org={inspectingOrg}
        onClose={() => setInspectingOrg(null)}
        onResetPassword={handleResetPassword}
        onEdit={handleEditClick}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />

      {/* Onboard Organization Modal */}
      <OnboardOrgModal
        isOpen={showOnboardModal}
        onClose={() => {
          setShowOnboardModal(false);
          setOnboardedResult(null);
        }}
        newOrg={newOrg}
        setNewOrg={setNewOrg}
        onboardedResult={onboardedResult}
        onboardSubmit={handleOnboardSubmit}
        onboarding={onboarding}
        copied={copied}
        onCopyPassword={handleCopyPassword}
      />

      {/* Edit Organization Modal */}
      <EditOrgModal
        editingOrg={editingOrg}
        onClose={() => setEditingOrg(null)}
        editForm={editForm}
        setEditForm={setEditForm}
        updating={updating}
        onUpdateSubmit={handleUpdate}
      />

      {/* Deactivate Organization Modal */}
      <DeactivateOrgModal
        deactivatingOrg={deactivatingOrg}
        onClose={() => setDeactivatingOrg(null)}
        deactivateRemark={deactivateRemark}
        setDeactivateRemark={setDeactivateRemark}
        togglingStatus={togglingStatus}
        onSubmit={submitDeactivation}
      />

      {/* Plan Management Configuration Modal (shortcut fallback) */}
      <PlanManagementModal
        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
      />
    </div>
  );
};

export default SystemAdminDashboard;
