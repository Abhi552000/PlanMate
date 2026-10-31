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
    if (!name || !email || !password) {
      toast.error(TOAST_MESSAGES.MEMBER_FIELDS_REQUIRED);
      return;
    }
    setAddingMember(true);
    try {
      const data = await orgService.addOrgMember(newMember);
      if (data?.success) {
        toast.success(TOAST_MESSAGES.MEMBER_ONBOARD_SUCCESS(name));
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-semibold">
          Loading team members...
        </p>
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
