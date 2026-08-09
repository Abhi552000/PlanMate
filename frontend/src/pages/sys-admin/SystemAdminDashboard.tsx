import React from "react";
import { ShieldAlert, Plus } from "lucide-react";
import { SystemAdminDashboardProps } from "../../types";

// Sub-components
import { SysAdminHeader } from "./components/SysAdminHeader";
import { OrgListTable } from "./components/OrgListTable";
import { OnboardOrgModal } from "./components/OnboardOrgModal";
import { EditOrgModal } from "./components/EditOrgModal";
import { DeactivateOrgModal } from "./components/DeactivateOrgModal";
import { useSystemAdmin } from "./hooks/useSystemAdmin";

const SystemAdminDashboard: React.FC<SystemAdminDashboardProps> = ({ onLogout, user }) => {
  const {
    organizations, loading, showOnboardModal, setShowOnboardModal, newOrg, setNewOrg,
    onboardedResult, setOnboardedResult, copied, editingOrg, setEditingOrg, editForm,
    setEditForm, deactivatingOrg, setDeactivatingOrg, deactivateRemark, setDeactivateRemark,
    searchQuery, setSearchQuery, onboarding, updating, togglingStatus, error, setError,
    success, setSuccess, handleOnboardSubmit, handleEditClick, handleUpdate,
    handleToggleActive, submitDeactivation, handleDelete, handleCopyPassword,
  } = useSystemAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-505" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans">
      <SysAdminHeader user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl text-white shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                System Administration Dashboard
              </h2>
              <p className="text-xs font-semibold text-gray-405">
                Manage organization tenants, toggle active status, and generate admin passwords.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowOnboardModal(true);
              setOnboardedResult(null);
              setError(null);
              setSuccess(null);
            }}
            className="bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-md transition-all duration-200 cursor-pointer text-sm self-start md:self-auto"
          >
            <Plus className="w-4.5 h-4.5" /> Onboard Organization
          </button>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50 animate-fadeIn font-semibold">{error}</div>
        )}
        {success && (
          <div className="text-sm text-green-700 bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-100 dark:border-green-900/50 font-bold animate-fadeIn">{success}</div>
        )}

        <OrgListTable
          organizations={organizations}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          togglingStatus={togglingStatus}
          onToggleActive={handleToggleActive}
          onEditClick={handleEditClick}
          onDeleteClick={handleDelete}
        />
      </main>

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

      <EditOrgModal
        editingOrg={editingOrg}
        onClose={() => setEditingOrg(null)}
        editForm={editForm}
        setEditForm={setEditForm}
        updating={updating}
        onUpdateSubmit={handleUpdate}
      />

      <DeactivateOrgModal
        deactivatingOrg={deactivatingOrg}
        onClose={() => setDeactivatingOrg(null)}
        deactivateRemark={deactivateRemark}
        setDeactivateRemark={setDeactivateRemark}
        togglingStatus={togglingStatus}
        onSubmit={submitDeactivation}
      />
    </div>
  );
};

export default SystemAdminDashboard;
