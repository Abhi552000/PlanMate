import { useEffect, useState } from "react";
import { orgService } from "../../../services/orgService";

export const useSystemAdmin = () => {
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

  return {
    organizations,
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
  };
};
