import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { orgService } from "../../services/orgService";
import { IUser } from "../../types";
import { ROUTES } from "../../constants/routeConstant";
import { TOAST_MESSAGES, CONSOLE_ERRORS } from "../../constants/messages";

// Sub-components
import { OrgAdminHeader } from "./components/OrgAdminHeader";
import { OrgMembersTable } from "./components/OrgMembersTable";
import { OnboardMemberModal } from "./components/OnboardMemberModal";
import { InspectingUserModal } from "./components/InspectingUserModal";
import { AccessRemarkModal } from "./components/AccessRemarkModal";

const ITEMS_PER_PAGE = 5;

const OrganizationAdmin = () => {
  const navigate = useNavigate();

  const [currentUser] = useState<IUser | null>(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  const isOrgAdmin = currentUser?.role === "org_admin";

  const [orgData, setOrgData] = useState({
    name: "",
    description: "",
  });

  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const isFirstMount = useRef(true);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Member invite inputs
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Details Modal State
  const [inspectingUser, setInspectingUser] = useState<any | null>(null);

  // Status Remark Modal State
  const [remarkModalOpen, setRemarkModalOpen] = useState(false);
  const [selectedUserForStatusChange, setSelectedUserForStatusChange] = useState<any | null>(null);
  const [pendingNewStatus, setPendingNewStatus] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  // Fetch organization branding details
  const fetchOrgDetails = async () => {
    try {
      const data = await orgService.getOrgDetails();
      if (data?.success && data?.organization) {
        setOrgData({
          name: data.organization.name || "",
          description: data.organization.description || "",
        });
      }
    } catch (err) {
      console.error(CONSOLE_ERRORS.FETCH_ORG_DETAILS, err);
    }
  };

  // Fetch organization users list with backend filter integration
  const fetchTeamUsers = useCallback(
    async (
      page = 1,
      status = selectedStatus,
      role = selectedRole,
      search = debouncedSearch
    ) => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });
        if (status && status !== "all") {
          params.append("status", status);
        }
        if (role && role !== "all") {
          params.append("role", role);
        }
        if (search && search.trim()) {
          params.append("search", search.trim());
        }
        const data = await orgService.getOrgUsers(params);
        if (data?.success && data?.users) {
          setTeamUsers(data.users);
          setCurrentPage(data.pagination.currentPage);
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.totalCount);
        }
      } catch (err) {
        console.error(CONSOLE_ERRORS.FETCH_ORG_USERS, err);
      }
    },
    [selectedStatus, selectedRole, debouncedSearch]
  );

  // Trigger backend fetch whenever debounced search, status, or role changes
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    fetchTeamUsers(1, selectedStatus, selectedRole, debouncedSearch);
  }, [debouncedSearch, selectedStatus, selectedRole, fetchTeamUsers]);

  const handleStatusChange = (newStatusVal: string) => {
    setSelectedStatus(newStatusVal);
  };

  const handleRoleChange = (newRoleVal: string) => {
    setSelectedRole(newRoleVal);
  };

  const handleSearchChange = (newSearchVal: string) => {
    setSearchQuery(newSearchVal);
  };

  const handleResetFilters = () => {
    setSelectedStatus("all");
    setSelectedRole("all");
    setSearchQuery("");
  };

  useEffect(() => {
    const loadAll = async () => {
      if (!isOrgAdmin) {
        navigate(ROUTES.DASHBOARD);
        return;
      }
      setLoading(true);
      try {
        await Promise.all([
          fetchOrgDetails(),
          fetchTeamUsers(1, "all", "all", ""),
        ]);
      } catch (err) {
        console.error(CONSOLE_ERRORS.LOAD_ROSTER, err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [isOrgAdmin, navigate]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password } = newMember;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      toast.error("Please enter the member's full name");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setAddingMember(true);
    try {
      const data = await orgService.addOrgMember({
        name: trimmedName,
        email: trimmedEmail,
        password,
      });
      if (data?.success) {
        toast.success(TOAST_MESSAGES.MEMBER_ONBOARD_SUCCESS(trimmedName));
        setNewMember({ name: "", email: "", password: "" });
        setShowOnboardModal(false);
        await fetchTeamUsers();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.MEMBER_ONBOARD_ERROR);
    } finally {
      setAddingMember(false);
    }
  };

  const handleUpdateUserStatus = async (targetUser: any, newStatusVal: string, remark?: string) => {
    setTogglingStatus(true);
    try {
      const data = await orgService.updateUserStatus(targetUser._id, newStatusVal, remark);
      if (data?.success) {
        toast.success(
          TOAST_MESSAGES.MEMBER_STATUS_GRANT_SUCCESS(targetUser.name, newStatusVal)
        );
        await fetchTeamUsers();
        if (inspectingUser && inspectingUser._id === targetUser._id) {
          setInspectingUser((prev: any) => ({ ...prev, status: newStatusVal, statusRemark: remark || "" }));
        }
        setRemarkModalOpen(false);
        setSelectedUserForStatusChange(null);
        setPendingNewStatus(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.MEMBER_STATUS_UPDATE_ERROR);
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleUpdateUserStatusClick = (targetUser: any, actionType: "activate" | "deactivate") => {
    setSelectedUserForStatusChange(targetUser);
    const targetStatus = actionType === "activate" ? "active" : "rejected";
    setPendingNewStatus(targetStatus);
    setRemarkModalOpen(true);
  };

  if (loading) {
    return (
      <div className="w-full space-y-6 font-sans animate-pulse select-none">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 dark:border-gray-800 pb-4">
          <div className="space-y-2">
            <div className="h-7 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-72 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="h-[38px] w-36 rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Filters Skeleton */}
        <div className="p-3 sm:p-4 rounded-xl border border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col md:flex-row gap-3 justify-between">
          <div className="flex flex-wrap gap-2 flex-1">
            <div className="h-[38px] w-56 rounded-lg bg-slate-100 dark:bg-slate-800" />
            <div className="h-[38px] w-28 rounded-lg bg-slate-100 dark:bg-slate-800" />
            <div className="h-[38px] w-28 rounded-lg bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="h-[38px] w-20 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>

        {/* Table Skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-5 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-800/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-sans">
      <OrgAdminHeader
        orgName={orgData.name}
        onOnboardClick={() => setShowOnboardModal(true)}
      />

      <OrgMembersTable
        teamUsers={teamUsers}
        currentUser={currentUser}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        togglingStatus={togglingStatus}
        onPageChange={(page) => {
          fetchTeamUsers(page, selectedStatus, selectedRole, debouncedSearch);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onInspectUser={setInspectingUser}
        onUpdateUserStatusClick={handleUpdateUserStatusClick}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onResetFilters={handleResetFilters}
      />

      <InspectingUserModal
        inspectingUser={inspectingUser}
        onClose={() => setInspectingUser(null)}
      />

      <OnboardMemberModal
        isOpen={showOnboardModal}
        onClose={() => setShowOnboardModal(false)}
        newMember={newMember}
        setNewMember={setNewMember}
        addingMember={addingMember}
        onAddMember={handleAddMember}
      />

      <AccessRemarkModal
        isOpen={remarkModalOpen}
        onClose={() => {
          setRemarkModalOpen(false);
          setSelectedUserForStatusChange(null);
          setPendingNewStatus(null);
        }}
        onConfirm={(remark) => {
          if (selectedUserForStatusChange && pendingNewStatus) {
            handleUpdateUserStatus(selectedUserForStatusChange, pendingNewStatus, remark);
          }
        }}
        title={
          pendingNewStatus === "active"
            ? "Approve & Grant Workspace Access"
            : "Reject / Deactivate User Access"
        }
        description={
          pendingNewStatus === "active"
            ? `Are you sure you want to approve and grant workspace privileges to ${selectedUserForStatusChange?.name}?`
            : `Please provide a reason or administrative note for rejecting/deactivating ${selectedUserForStatusChange?.name}.`
        }
        loading={togglingStatus}
      />
    </div>
  );
};

export default OrganizationAdmin;
