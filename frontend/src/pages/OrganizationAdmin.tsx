import React, { useEffect, useState } from "react";
import {
  Building,
  Users,
  UserPlus,
  User,
  Mail,
  Lock,
  Plus,
  Check,
  X,
  Eye,
  Power,
  RotateCcw,
  Calendar,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { orgService } from "../services/orgService";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { IUser } from "../types";

interface ExtendedUser extends IUser {
  solvedTasks?: number;
  createdAt?: string;
  solvedTasksCount?: number;
  solvedTasksCountDetail?: any;
}

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
  const ITEMS_PER_PAGE = 5;

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
        navigate("/");
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl text-white shadow-md">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-250">
              {orgData.name || "Manage Team Workspace"}
            </h1>
            <p className="text-xs font-semibold text-gray-400">
              Approve pending access requests, monitor tickets, and manage team members.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowOnboardModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow hover:from-cyan-600 hover:to-sky-750"
          >
            <UserPlus className="w-4 h-4" /> Onboard Team Member
          </button>
        </div>
      </div>


      {/* Full-Width User Management Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-sky-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-sky-500" /> User Access & Approval Management
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sky-50/70 dark:border-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-300 uppercase bg-gray-50/30 dark:bg-gray-950/20">
                <th className="px-6 py-4">User Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Solved Tickets</th>
                <th className="px-6 py-4">Access Status</th>
                <th className="px-6 py-4 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50/45 dark:divide-gray-800 text-sm">
              {teamUsers.map((member) => (
                <tr
                  key={member._id}
                  className={`hover:bg-sky-50/20 transition-all ${
                    member.status === "pending"
                      ? "bg-amber-50/[0.08]"
                      : member.status === "rejected"
                      ? "bg-red-50/[0.04]"
                      : ""
                  }`}
                >
                  <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-500 text-xs dark:text-gray-400">
                    {member.email}
                  </td>
                  <td className="px-6 py-4">
                    {member.role === "org_admin" ? (
                      <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wide">
                        Org Admin
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200 uppercase tracking-wide">
                        Member
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-700 dark:text-gray-300 font-bold">
                    {member.solvedTasks || 0} Solved
                  </td>
                  <td className="px-6 py-4">
                    {member.status === "active" ||
                    member.status === undefined ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                        Approved
                      </span>
                    ) : member.status === "pending" ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                        Pending Approval
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                        Access Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setInspectingUser(member)}
                        className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100 cursor-pointer"
                        title="View Full Profile Details"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>

                      {/* Don't let users edit their own status */}
                      {member.email !== currentUser?.email && (
                        <>
                          {member.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateUserStatus(member, "active")
                                }
                                disabled={togglingStatus}
                                className="p-1 text-green-600 hover:bg-green-50 rounded border border-transparent hover:border-green-200 transition-colors cursor-pointer"
                                title="Approve Access Request"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateUserStatus(member, "rejected")
                                }
                                disabled={togglingStatus}
                                className="p-1 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                                title="Reject Access Request"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {member.status === "active" && (
                            <button
                              onClick={() =>
                                handleUpdateUserStatus(member, "rejected")
                              }
                              disabled={togglingStatus}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                              title="Revoke / Deactivate Access"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}

                          {member.status === "rejected" && (
                            <button
                              onClick={() =>
                                handleUpdateUserStatus(member, "active")
                              }
                              disabled={togglingStatus}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-100 transition-colors cursor-pointer"
                              title="Restore Access"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalCount > ITEMS_PER_PAGE && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-sky-100 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-950/20 text-xs">
            <span className="font-semibold text-gray-550 dark:text-gray-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
              {totalCount} users
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => fetchTeamUsers(currentPage - 1)}
                className="px-3 py-1.5 rounded-lg border border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-650 dark:text-gray-300 font-bold hover:bg-sky-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => fetchTeamUsers(pageNum)}
                  className={`w-8 h-8 rounded-lg border font-bold flex items-center justify-center transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-sky-500 border-sky-500 text-white shadow-sm"
                      : "border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-650 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-850"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => fetchTeamUsers(currentPage + 1)}
                className="px-3 py-1.5 rounded-lg border border-sky-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-650 dark:text-gray-300 font-bold hover:bg-sky-50 dark:hover:bg-gray-850 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Details Inspect Modal */}
      {inspectingUser && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-sky-100 dark:border-gray-800 max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-850 pb-3">
              <h3 className="font-bold text-gray-805 dark:text-gray-200 text-base flex items-center gap-1.5">
                <User className="w-5 h-5 text-sky-500" /> Member Details
              </h3>
              <button
                onClick={() => setInspectingUser(null)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-sky-50/20 p-3 rounded-xl border border-sky-100/30">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {inspectingUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-250 text-base">
                    {inspectingUser.name}
                  </h4>
                  <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    {inspectingUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500">
                <div className="space-y-1">
                  <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px]">
                    Email Address
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 truncate block">
                    {inspectingUser.email}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px]">
                    Workspace Access
                  </span>
                  <div>
                    {inspectingUser.status === "active" ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                        Approved
                      </span>
                    ) : inspectingUser.status === "pending" ? (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                        Pending
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px]">
                    Member Since
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    {inspectingUser.createdAt
                      ? new Date(inspectingUser.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px]">
                    Tickets Resolved
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1 font-bold">
                    <ClipboardList className="w-3.5 h-3.5 text-sky-400" />
                    {inspectingUser.solvedTasks || 0} Tasks
                  </span>
                </div>
              </div>

              {/* Approval controls inside details modal */}
              {inspectingUser.email !== currentUser?.email && (
                <div className="pt-4 border-t border-sky-50 dark:border-gray-800 flex items-center justify-end gap-2">
                  {inspectingUser.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateUserStatus(inspectingUser, "rejected")
                        }
                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-lg text-xs transition-colors cursor-pointer bg-white dark:bg-gray-900"
                      >
                        Reject Access
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateUserStatus(inspectingUser, "active")
                        }
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                      >
                        Approve Access
                      </button>
                    </>
                  )}

                  {inspectingUser.status === "active" && (
                    <button
                      onClick={() =>
                        handleUpdateUserStatus(inspectingUser, "rejected")
                      }
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      Revoke Workspace Access
                    </button>
                  )}

                  {inspectingUser.status === "rejected" && (
                    <button
                      onClick={() =>
                        handleUpdateUserStatus(inspectingUser, "active")
                      }
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-xs hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      Restore Access
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Onboard Team Member Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-sky-50 dark:border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-gray-850 dark:text-gray-200 flex items-center gap-2">
                <UserPlus className="w-4.5 h-4.5 text-sky-500" /> Onboard Team Member
              </h3>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="text-gray-400 hover:text-sky-600 transition-colors p-1 rounded-full cursor-pointer hover:bg-sky-50 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                value={newMember.name}
                onChange={(e) =>
                  setNewMember((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                icon={<User className="w-4 h-4 text-sky-500" />}
                placeholder="John Doe"
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={newMember.email}
                onChange={(e) =>
                  setNewMember((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                icon={<Mail className="w-4 h-4 text-sky-500" />}
                placeholder="john@tcs.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={newMember.password}
                onChange={(e) =>
                  setNewMember((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                icon={<Lock className="w-4 h-4 text-sky-500" />}
                placeholder="At least 8 characters"
                required
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-sky-50 dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOnboardModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={addingMember}
                  icon={<Plus className="w-4.5 h-4.5" />}
                >
                  Onboard Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationAdmin;
