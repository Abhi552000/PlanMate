import React, { useEffect, useState } from "react";
import { ShieldAlert, Plus } from "lucide-react";
import { orgService } from "../../services/orgService";
import { IUser } from "../../types";

// Sub-components
import { SysAdminHeader } from "./components/SysAdminHeader";
import { OrgListTable } from "./components/OrgListTable";
import { OnboardOrgModal } from "./components/OnboardOrgModal";
import { EditOrgModal } from "./components/EditOrgModal";
import { DeactivateOrgModal } from "./components/DeactivateOrgModal";

interface SystemAdminDashboardProps {
  onLogout: () => void;
  user: IUser | null;
}

const SystemAdminDashboard: React.FC<SystemAdminDashboardProps> = ({ onLogout, user }) => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Onboard Modal states
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [newOrg, setNewOrg] = useState({
    orgName: "",
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });
  const [onboardedResult, setOnboardedResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit Modal State
  const [editingOrg, setEditingOrg] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    orgName: "",
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

  // Deactivate Modal State
  const [deactivatingOrg, setDeactivatingOrg] = useState<any | null>(null);
  const [deactivateRemark, setDeactivateRemark] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [onboarding, setOnboarding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const data = await orgService.getSystemAdminOrgs();
      if (data?.success && data?.organizations) {
        setOrganizations(data.organizations);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch organizations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { orgName, adminName, adminEmail } = newOrg;
    if (!orgName || !adminName || !adminEmail) {
      setError("Please fill in organization name, admin name, and admin email.");
      return;
    }
    setOnboarding(true);
    setError(null);
    setSuccess(null);
    setOnboardedResult(null);

    try {
      const data = await orgService.onboardOrg(newOrg);
      if (data?.success) {
        setOnboardedResult({
          orgName: orgName,
          email: data.admin?.email,
          password: data.admin?.password
        });
        setNewOrg({ orgName: "", adminName: "", adminEmail: "", adminPassword: "" });
        await fetchOrganizations();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to onboard organization.");
    } finally {
      setOnboarding(false);
    }
  };

  const handleEditClick = (org: any) => {
    setEditingOrg(org);
    setEditForm({
      orgName: org.name || "",
      adminName: org.admin?.name || "",
      adminEmail: org.admin?.email || "",
      adminPassword: ""
    });
    setError(null);
    setSuccess(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await orgService.updateOrgAdmin(editingOrg._id, editForm);
      if (data?.success) {
        setSuccess(`Successfully updated organization details!`);
        setEditingOrg(null);
        await fetchOrganizations();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update organization.");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = async (org: any) => {
    setError(null);
    setSuccess(null);

    if (org.isActive) {
      setDeactivatingOrg(org);
      setDeactivateRemark("");
      return;
    }

    setTogglingStatus(true);
    try {
      const data = await orgService.updateOrgStatus(org._id, {
        isActive: true,
        remark: ""
      });
      if (data?.success) {
        setSuccess(`Successfully activated organization "${org.name}".`);
        await fetchOrganizations();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to activate organization.");
    } finally {
      setTogglingStatus(false);
    }
  };

  const submitDeactivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deactivatingOrg) return;
    setTogglingStatus(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await orgService.updateOrgStatus(deactivatingOrg._id, {
        isActive: false,
        remark: deactivateRemark.trim() || "Deactivated by System Admin"
      });
      if (data?.success) {
        setSuccess(`Successfully deactivated organization "${deactivatingOrg.name}".`);
        setDeactivatingOrg(null);
        await fetchOrganizations();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to deactivate organization.");
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleDelete = async (org: any) => {
    if (!window.confirm(`WARNING: Are you sure you want to delete organization "${org.name}"?\n\nThis will PERMANENTLY delete all users and tasks associated with it. This action cannot be undone.`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      const data = await orgService.deleteOrg(org._id);
      if (data?.success) {
        setSuccess(`Successfully deleted organization "${org.name}".`);
        await fetchOrganizations();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete organization.");
    }
  };

  const handleCopyPassword = () => {
    if (!onboardedResult) return;
    navigator.clipboard.writeText(onboardedResult.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-955 flex flex-col font-sans">
      <SysAdminHeader user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-sky-101/50 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl text-white shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-850 dark:text-gray-200">
                System Administration Dashboard
              </h2>
              <p className="text-xs font-semibold text-gray-400">
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
          <div className="text-sm text-red-606 bg-red-50 dark:bg-red-955/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50 animate-fadeIn font-semibold">{error}</div>
        )}
        {success && (
          <div className="text-sm text-green-708 bg-green-50 dark:bg-green-955/20 p-4 rounded-xl border border-green-100 dark:border-green-900/50 font-bold animate-fadeIn">{success}</div>
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
