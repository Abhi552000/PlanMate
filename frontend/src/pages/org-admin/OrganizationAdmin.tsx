import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { orgService } from "../../services/orgService";
import { IUser } from "../../types";
import { ROUTES } from "../../constants/routeConstant";

// Sub-components
import { OrgAdminHeader } from "./components/OrgAdminHeader";
import { OrgMembersTable } from "./components/OrgMembersTable";
import { OnboardMemberModal } from "./components/OnboardMemberModal";
import { InspectingUserModal } from "./components/InspectingUserModal";

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

  // Member invite inputs
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Details Modal State
  const [inspectingUser, setInspectingUser] = useState<any | null>(null);

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
      console.error("Error fetching org details:", err);
    }
  };

  // Fetch organization users list (including solved ticket stats)
  const fetchTeamUsers = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      const data = await orgService.getOrgUsers(params);
      if (data?.success && data?.users) {
        setTeamUsers(data.users);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (err) {
      console.error("Error fetching organization users:", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      if (!isOrgAdmin) {
        navigate(ROUTES.DASHBOARD);
        return;
      }
      setLoading(true);
      await Promise.all([fetchOrgDetails(), fetchTeamUsers()]);
      setLoading(false);
    };
    loadAll();
  }, [isOrgAdmin, navigate]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password } = newMember;
    if (!name || !email || !password) {
      toast.error("Please fill all member onboarding fields");
      return;
    }
    setAddingMember(true);
    try {
      const data = await orgService.addOrgMember(newMember);
      if (data?.success) {
        toast.success(`Member ${name} onboarded successfully!`);
        setNewMember({ name: "", email: "", password: "" });
        setShowOnboardModal(false);
        await fetchTeamUsers();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const handleUpdateUserStatus = async (targetUser: any, newStatus: string) => {
    setTogglingStatus(true);
    try {
      const data = await orgService.updateUserStatus(targetUser._id, newStatus);
      if (data?.success) {
        toast.success(
          `Access request for ${targetUser.name} is now updated to ${newStatus}.`
        );
        await fetchTeamUsers();
        if (inspectingUser && inspectingUser._id === targetUser._id) {
          setInspectingUser((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update user status");
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-semibold animate-pulse">
          Loading workspace roster...
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
        onPageChange={fetchTeamUsers}
        onInspectUser={setInspectingUser}
        onUpdateUserStatus={handleUpdateUserStatus}
      />

      <InspectingUserModal
        inspectingUser={inspectingUser}
        onClose={() => setInspectingUser(null)}
        currentUser={currentUser}
        onUpdateUserStatus={handleUpdateUserStatus}
      />

      <OnboardMemberModal
        isOpen={showOnboardModal}
        onClose={() => setShowOnboardModal(false)}
        newMember={newMember}
        setNewMember={setNewMember}
        addingMember={addingMember}
        onAddMember={handleAddMember}
      />
    </div>
  );
};

export default OrganizationAdmin;
