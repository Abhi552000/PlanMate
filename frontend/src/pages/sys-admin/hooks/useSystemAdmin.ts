import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { orgService } from "../../../services/orgService";
import { SystemMetrics } from "../../../types";
import { TOAST_MESSAGES } from "../../../constants/messages";

export const useSystemAdmin = () => {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Onboard Modal states
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [newOrg, setNewOrg] = useState({
    orgName: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    description: "",
    industry: "",
    companySize: "",
    website: "",
    location: "",
    phone: "",
  });
  const [onboardedResult, setOnboardedResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Edit Modal State
  const [editingOrg, setEditingOrg] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    orgName: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    description: "",
    industry: "",
    companySize: "",
    website: "",
    location: "",
    phone: "",
  });

  // Deactivate Modal State
  const [deactivatingOrg, setDeactivatingOrg] = useState<any | null>(null);
  const [deactivateRemark, setDeactivateRemark] = useState("");

  // Restore Confirmation Modal State
  const [restoringOrg, setRestoringOrg] = useState<any | null>(null);

  // Delete Confirmation Modal State
  const [deletingOrg, setDeletingOrg] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Inspect Drawer State
  const [inspectingOrg, setInspectingOrg] = useState<any | null>(null);

  // 1-Click Reset Password Modal State
  const [resetPasswordOrg, setResetPasswordOrg] = useState<any | null>(null);
  const [resetResult, setResetResult] = useState<any | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [copiedReset, setCopiedReset] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [itemsPerPage] = useState<number>(10);
  const [tableLoading, setTableLoading] = useState(false);

  const [onboarding, setOnboarding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Debounce search query to prevent unnecessary backend calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStatusFilterChange = (status: "all" | "active" | "inactive") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const isInitialLoadRef = useRef(true);

  const fetchOrganizations = useCallback(
    async () => {
      // Only show full dashboard skeleton on initial first mount
      if (isInitialLoadRef.current) {
        setLoading(true);
      } else {
        setTableLoading(true);
      }
      try {
        const params: Record<string, any> = {
          status: statusFilter,
          page: currentPage,
          limit: itemsPerPage,
        };
        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }
        const data = await orgService.getSystemAdminOrgs(params);
        if (data?.success && data?.organizations) {
          setOrganizations(data.organizations);
          if (data.systemMetrics) {
            setSystemMetrics(data.systemMetrics);
          }
          if (data.pagination) {
            setTotalCount(data.pagination.total);
            setTotalPages(data.pagination.totalPages);
          }
        }
      } catch (err: any) {
        console.error(err);
        toast.error(err?.response?.data?.message || TOAST_MESSAGES.SYSADMIN_FETCH_ORGS_ERROR);
      } finally {
        isInitialLoadRef.current = false;
        setLoading(false);
        setTableLoading(false);
      }
    },
    [statusFilter, debouncedSearch, currentPage, itemsPerPage]
  );

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { orgName, adminName, adminEmail } = newOrg;
    if (!orgName?.trim() || !adminName?.trim() || !adminEmail?.trim()) {
      toast.error(TOAST_MESSAGES.SYSADMIN_ONBOARD_REQUIRED_FIELDS);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail.trim())) {
      toast.error(TOAST_MESSAGES.SYSADMIN_INVALID_ADMIN_EMAIL);
      return;
    }
    setOnboarding(true);
    setOnboardedResult(null);

    try {
      const data = await orgService.onboardOrg({
        ...newOrg,
        orgName: orgName.trim(),
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim(),
      });
      if (data?.success) {
        toast.success(data?.message || TOAST_MESSAGES.SYSADMIN_ONBOARD_SUCCESS);
        setOnboardedResult({
          orgName: orgName.trim(),
          email: data.admin?.email,
          password: data.admin?.password,
        });
        setNewOrg({
          orgName: "",
          adminName: "",
          adminEmail: "",
          adminPassword: "",
          description: "",
          industry: "",
          companySize: "",
          website: "",
          location: "",
          phone: "",
        });
        await fetchOrganizations();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.SYSADMIN_ONBOARD_ERROR);
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
      adminPassword: "",
      description: org.description || "",
      industry: org.industry || "",
      companySize: org.companySize || "",
      website: org.website || "",
      location: org.location || "",
      phone: org.phone || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    if (!editForm.orgName?.trim()) {
      toast.error(TOAST_MESSAGES.SYSADMIN_ORG_NAME_REQUIRED);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editForm.adminEmail && !emailRegex.test(editForm.adminEmail.trim())) {
      toast.error(TOAST_MESSAGES.SYSADMIN_INVALID_ADMIN_EMAIL);
      return;
    }
    setUpdating(true);

    try {
      const data = await orgService.updateOrgAdmin(editingOrg._id, {
        ...editForm,
        orgName: editForm.orgName.trim(),
        adminName: editForm.adminName?.trim(),
        adminEmail: editForm.adminEmail?.trim(),
      });
      if (data?.success) {
        toast.success(data?.message || TOAST_MESSAGES.SYSADMIN_ORG_UPDATE_SUCCESS);
        setEditingOrg(null);
        await fetchOrganizations();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.SYSADMIN_ORG_UPDATE_ERROR);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = (org: any) => {
    if (org.isActive) {
      setDeactivatingOrg(org);
      setDeactivateRemark("");
      return;
    }
    setRestoringOrg(org);
  };

  const handleRestoreOrgConfirm = async () => {
    if (!restoringOrg) return;
    setTogglingStatus(true);
    try {
      const data = await orgService.updateOrgStatus(restoringOrg._id, {
        isActive: true,
        remark: "",
      });
      if (data?.success) {
        toast.success(data?.message || TOAST_MESSAGES.SYSADMIN_ORG_RESTORE_SUCCESS(restoringOrg.name));
        setRestoringOrg(null);
        await fetchOrganizations();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.SYSADMIN_ORG_RESTORE_ERROR);
    } finally {
      setTogglingStatus(false);
    }
  };

  const submitDeactivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deactivatingOrg) return;
    setTogglingStatus(true);

    try {
      const data = await orgService.updateOrgStatus(deactivatingOrg._id, {
        isActive: false,
        remark: deactivateRemark.trim() || "Deactivated by System Admin",
      });
      if (data?.success) {
        toast.success(data?.message || TOAST_MESSAGES.SYSADMIN_ORG_DEACTIVATE_SUCCESS(deactivatingOrg.name));
        setDeactivatingOrg(null);
        await fetchOrganizations();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.SYSADMIN_ORG_DEACTIVATE_ERROR);
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleDelete = (org: any) => {
    setDeletingOrg(org);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOrg) return;
    setDeleting(true);
    try {
      const data = await orgService.deleteOrg(deletingOrg._id);
      if (data?.success) {
        toast.success(data?.message || TOAST_MESSAGES.SYSADMIN_ORG_DELETE_SUCCESS(deletingOrg.name));
        if (inspectingOrg?._id === deletingOrg._id) setInspectingOrg(null);
        setDeletingOrg(null);
        await fetchOrganizations();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.SYSADMIN_ORG_DELETE_ERROR);
    } finally {
      setDeleting(false);
    }
  };

  // 1-Click Reset Password Action
  const handleResetPassword = async (org: any) => {
    setResetPasswordOrg(org);
    setResetResult(null);
  };

  const handleResetPasswordConfirm = async () => {
    if (!resetPasswordOrg) return;
    setResettingPassword(true);
    try {
      const data = await orgService.resetAdminPassword(resetPasswordOrg._id);
      if (data?.success && data?.admin) {
        setResetResult(data.admin);
        toast.success(TOAST_MESSAGES.SYSADMIN_RESET_PASSWORD_SUCCESS(resetPasswordOrg.name));
        await fetchOrganizations();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.SYSADMIN_RESET_PASSWORD_ERROR);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleCopyResetPassword = () => {
    if (!resetResult?.temporaryPassword) return;
    navigator.clipboard.writeText(resetResult.temporaryPassword);
    setCopiedReset(true);
    setTimeout(() => setCopiedReset(false), 2000);
  };

  const handleCopyPassword = () => {
    if (!onboardedResult) return;
    navigator.clipboard.writeText(onboardedResult.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export CSV
  const exportOrganizationsCSV = async () => {
    try {
      const params: Record<string, any> = {
        status: statusFilter,
      };
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      const data = await orgService.getSystemAdminOrgs(params);
      const orgsToExport = data?.organizations?.length ? data.organizations : organizations;
      if (!orgsToExport.length) return;

      const headers = [
        "Organization Name",
        "Slug",
        "Admin Name",
        "Admin Email",
        "Plan",
        "Billing Cycle",
        "Members Count",
        "Tasks Count",
        "Status",
        "Created Date",
        "Deactivation Remark",
      ];

      const rows = orgsToExport.map((o: any) => [
        `"${(o.name || "").replace(/"/g, '""')}"`,
        `"${(o.slug || "").replace(/"/g, '""')}"`,
        `"${(o.admin?.name || "").replace(/"/g, '""')}"`,
        `"${(o.admin?.email || "").replace(/"/g, '""')}"`,
        `"${(o.subscription?.planName || "Starter").replace(/"/g, '""')}"`,
        `"${(o.subscription?.billingCycle || "Monthly").replace(/"/g, '""')}"`,
        o.memberCount || 0,
        o.taskCount || o.taskCounter || 0,
        o.isActive ? "Active" : "Inactive",
        o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : "",
        `"${(o.remark || "").replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `planmate_tenants_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error("Export CSV error:", err);
      toast.error("Failed to export organizations.");
    }
  };

  return {
    organizations,
    systemMetrics,
    loading,
    tableLoading,
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
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    currentPage,
    setCurrentPage,
    totalPages,
    totalCount,
    onboarding,
    updating,
    togglingStatus,
    handleOnboardSubmit,
    handleEditClick,
    handleUpdate,
    handleToggleActive,
    restoringOrg,
    setRestoringOrg,
    handleRestoreOrgConfirm,
    submitDeactivation,
    handleDelete,
    deletingOrg,
    setDeletingOrg,
    deleting,
    handleDeleteConfirm,
    handleCopyPassword,
    handleResetPassword,
    handleResetPasswordConfirm,
    handleCopyResetPassword,
    exportOrganizationsCSV,
    fetchOrganizations,
  };
};
