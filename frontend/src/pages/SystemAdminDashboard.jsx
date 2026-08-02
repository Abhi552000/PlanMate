import React, { useEffect, useState } from "react";
import { 
  Building, 
  User, 
  Mail, 
  Lock, 
  Plus, 
  ShieldAlert, 
  Calendar,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  LogOut,
  Power,
  AlertTriangle,
  Copy,
  Check
} from "lucide-react";
import axiosInstance from "../config";

const SystemAdminDashboard = ({ onLogout, user }) => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Onboard Modal states
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [newOrg, setNewOrg] = useState({
    orgName: "",
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });
  const [onboardedResult, setOnboardedResult] = useState(null); // Will store { email, password }
  const [copied, setCopied] = useState(false);

  // Edit Modal State
  const [editingOrg, setEditingOrg] = useState(null);
  const [editForm, setEditForm] = useState({
    orgName: "",
    adminName: "",
    adminEmail: "",
    adminPassword: ""
  });

  // Deactivate Modal State
  const [deactivatingOrg, setDeactivatingOrg] = useState(null);
  const [deactivateRemark, setDeactivateRemark] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [onboarding, setOnboarding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/api/organization/all");
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

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    const { orgName, adminName, adminEmail, adminPassword } = newOrg;
    if (!orgName || !adminName || !adminEmail) {
      setError("Please fill in organization name, admin name, and admin email.");
      return;
    }
    setOnboarding(true);
    setError(null);
    setSuccess(null);
    setOnboardedResult(null);

    try {
      const { data } = await axiosInstance.post("/api/organization/onboard", newOrg);
      if (data?.success) {
        setOnboardedResult({
          orgName: orgName,
          email: data.admin?.email,
          password: data.admin?.password // Random password returned by API
        });
        setNewOrg({ orgName: "", adminName: "", adminEmail: "", adminPassword: "" });
        await fetchOrganizations();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to onboard organization.");
    } finally {
      setOnboarding(false);
    }
  };

  const handleEditClick = (org) => {
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingOrg) return;
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const { data } = await axiosInstance.put(`/api/organization/${editingOrg._id}/admin`, editForm);
      if (data?.success) {
        setSuccess(`Successfully updated organization details!`);
        setEditingOrg(null);
        await fetchOrganizations();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update organization.");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActive = async (org) => {
    setError(null);
    setSuccess(null);

    if (org.isActive) {
      setDeactivatingOrg(org);
      setDeactivateRemark("");
      return;
    }

    setTogglingStatus(true);
    try {
      const { data } = await axiosInstance.put(`/api/organization/${org._id}/status`, {
        isActive: true,
        remark: ""
      });
      if (data?.success) {
        setSuccess(`Successfully activated organization "${org.name}".`);
        await fetchOrganizations();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to activate organization.");
    } finally {
      setTogglingStatus(false);
    }
  };

  const submitDeactivation = async (e) => {
    e.preventDefault();
    if (!deactivatingOrg) return;
    setTogglingStatus(true);
    setError(null);
    setSuccess(null);

    try {
      const { data } = await axiosInstance.put(`/api/organization/${deactivatingOrg._id}/status`, {
        isActive: false,
        remark: deactivateRemark.trim() || "Deactivated by System Admin"
      });
      if (data?.success) {
        setSuccess(`Successfully deactivated organization "${deactivatingOrg.name}".`);
        setDeactivatingOrg(null);
        await fetchOrganizations();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to deactivate organization.");
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleDelete = async (org) => {
    if (!window.confirm(`WARNING: Are you sure you want to delete organization "${org.name}"?\n\nThis will PERMANENTLY delete all users and tasks associated with it. This action cannot be undone.`)) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      const { data } = await axiosInstance.delete(`/api/organization/${org._id}`);
      if (data?.success) {
        setSuccess(`Successfully deleted organization "${org.name}".`);
        await fetchOrganizations();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete organization.");
    }
  };

  const handleCopyPassword = () => {
    if (!onboardedResult) return;
    navigator.clipboard.writeText(onboardedResult.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.admin?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.admin?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* System Admin Standalone Header */}
      <header className="bg-white border-b border-sky-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white font-black tracking-wider shadow-md text-sm">
              PM
            </div>
            <div>
              <span className="font-extrabold text-gray-800 tracking-tight text-base sm:text-lg">PlanMate</span>
              <span className="text-[10px] font-bold text-sky-600 border border-sky-100 px-1.5 py-0.5 rounded ml-2 uppercase tracking-wide bg-sky-50/50">
                System Admin Site
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-700">{user?.name || "System Administrator"}</p>
              <p className="text-[10px] text-gray-400 font-semibold">{user?.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 border border-red-100 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Banner with Button */}
        <div className="bg-white p-6 rounded-2xl border border-sky-100/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl text-white shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
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
          <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 animate-fadeIn">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-700 bg-green-50 p-4 rounded-xl border border-green-100 font-medium animate-fadeIn">
            {success}
          </div>
        )}

        {/* Full Width Table list */}
        <div className="bg-white rounded-2xl border border-sky-100/50 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-sky-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Building className="w-4.5 h-4.5 text-sky-500" /> Active Organizations ({organizations.length})
            </h3>
            
            <div className="flex items-center border border-sky-100 rounded-lg px-2.5 py-1 bg-white focus-within:ring-1 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all text-xs max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-gray-400 mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:outline-none text-gray-700 bg-transparent py-0.5 w-full font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sky-50/70 text-[10px] font-bold text-gray-400 uppercase bg-gray-50/30">
                  <th className="px-6 py-4">Organization Name</th>
                  <th className="px-6 py-4">Admin Representative</th>
                  <th className="px-6 py-4">Admin Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50/45 text-sm">
                {filteredOrgs.map((org) => (
                  <tr 
                    key={org._id} 
                    className={`hover:bg-sky-50/20 transition-all ${
                      !org.isActive ? "bg-red-50/[0.07]" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {org.name}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600">
                      {org.admin?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-500">
                      {org.admin?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {org.isActive ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200">
                          Active
                        </span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 self-start">
                            Inactive
                          </span>
                          {org.remark && (
                            <span className="text-[9px] text-red-800 font-semibold italic truncate max-w-[160px]" title={org.remark}>
                              Reason: {org.remark}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-semibold">
                      {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleActive(org)}
                          disabled={togglingStatus}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            org.isActive 
                              ? "text-green-600 hover:text-red-600 hover:bg-red-50 border-transparent hover:border-red-100" 
                              : "text-red-500 hover:text-green-600 hover:bg-green-50 border-transparent hover:border-green-100"
                          }`}
                          title={org.isActive ? "Deactivate Organization" : "Activate Organization"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(org)}
                          className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100 cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(org)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                          title="Delete Instance"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredOrgs.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-xs text-gray-400 font-semibold bg-gray-50/10">
                      No organizations found matching search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Onboarding Form Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-sky-100 max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-sky-50 pb-3">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
                <Building className="w-5 h-5 text-sky-500" /> Onboard Organization
              </h3>
              <button 
                onClick={() => {
                  setShowOnboardModal(false);
                  setOnboardedResult(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-sky-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {onboardedResult ? (
              <div className="space-y-4 py-2 text-center">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-200">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-800 text-sm">Onboarding Complete!</h4>
                  <p className="text-xs text-gray-400 font-medium">Successfully created tenant site for {onboardedResult.orgName}</p>
                </div>

                <div className="bg-sky-50/40 p-4 rounded-xl border border-sky-100/50 text-left text-xs space-y-2.5">
                  <div>
                    <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px]">Admin Email</span>
                    <span className="font-bold text-gray-700">{onboardedResult.email}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-400 uppercase tracking-wider text-[9px]">Generated Temporary Password</span>
                    <div className="flex items-center justify-between bg-white p-2 rounded border border-sky-100 mt-1 select-all font-mono font-bold text-gray-800">
                      <span>{onboardedResult.password}</span>
                      <button
                        onClick={handleCopyPassword}
                        className="text-sky-600 hover:text-sky-700 p-1 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                        title="Copy Password"
                      >
                        {copied ? <span className="text-[10px] text-green-600 font-bold">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-red-500 font-semibold italic">Copy these credentials now. The temporary password will not be shown again.</p>

                <button
                  onClick={() => {
                    setShowOnboardModal(false);
                    setOnboardedResult(null);
                  }}
                  className="w-full bg-gradient-to-r cursor-pointer from-cyan-500 to-sky-600 text-white font-bold py-2 rounded-lg text-xs hover:shadow-md transition-all duration-200"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleOnboardSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Organization Name
                  </label>
                  <div className="flex items-center border border-sky-100 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                    <Building className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={newOrg.orgName}
                      onChange={(e) => setNewOrg(prev => ({ ...prev, orgName: e.target.value }))}
                      className="w-full focus:outline-none text-sm text-gray-800 font-semibold bg-transparent"
                      placeholder="e.g. Pepsi, TCS, Apple"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Admin Full Name
                  </label>
                  <div className="flex items-center border border-sky-100 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                    <User className="w-4.5 h-4.5 text-sky-500 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={newOrg.adminName}
                      onChange={(e) => setNewOrg(prev => ({ ...prev, adminName: e.target.value }))}
                      className="w-full focus:outline-none text-sm text-gray-800 font-semibold bg-transparent"
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Admin Email Address
                  </label>
                  <div className="flex items-center border border-sky-100 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                    <Mail className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
                    <input
                      type="email"
                      value={newOrg.adminEmail}
                      onChange={(e) => setNewOrg(prev => ({ ...prev, adminEmail: e.target.value }))}
                      className="w-full focus:outline-none text-sm text-gray-800 font-semibold bg-transparent"
                      placeholder="e.g. admin@tcs.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Custom Password (Optional)
                  </label>
                  <div className="flex items-center border border-sky-100 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                    <Lock className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
                    <input
                      type="password"
                      value={newOrg.adminPassword}
                      onChange={(e) => setNewOrg(prev => ({ ...prev, adminPassword: e.target.value }))}
                      className="w-full focus:outline-none text-sm text-gray-800 font-semibold bg-transparent"
                      placeholder="Leave blank to generate randomly"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-semibold">If left empty, a secure password will be generated automatically for the new administrator.</p>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-sky-50 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOnboardModal(false);
                      setNewOrg({ orgName: "", adminName: "", adminEmail: "", adminPassword: "" });
                    }}
                    className="px-4 py-2 border border-sky-200 text-gray-600 hover:bg-sky-50 font-bold rounded-lg text-xs transition-colors cursor-pointer bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={onboarding}
                    className="bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold py-2 px-5 rounded-lg flex items-center justify-center gap-1.5 hover:shadow-md transition-all duration-200 cursor-pointer text-xs"
                  >
                    {onboarding ? "Onboarding..." : "Onboard Organization"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {editingOrg && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-sky-100 max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-sky-50 pb-3">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
                <Building className="w-5 h-5 text-sky-500" /> Edit {editingOrg.name}
              </h3>
              <button 
                onClick={() => setEditingOrg(null)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-sky-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Organization Name
                </label>
                <div className="flex items-center border border-sky-100 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                  <Building className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={editForm.orgName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, orgName: e.target.value }))}
                    className="w-full focus:outline-none text-sm text-gray-800 font-semibold bg-transparent"
                    placeholder="Organization Name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Admin Name
                </label>
                <div className="flex items-center border border-sky-100 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                  <User className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={editForm.adminName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, adminName: e.target.value }))}
                    className="w-full focus:outline-none text-sm text-gray-800 font-semibold bg-transparent"
                    placeholder="Admin Name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Admin Email
                </label>
                <div className="flex items-center border border-sky-100 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                  <Mail className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
                  <input
                    type="email"
                    value={editForm.adminEmail}
                    onChange={(e) => setEditForm(prev => ({ ...prev, adminEmail: e.target.value }))}
                    className="w-full focus:outline-none text-sm text-gray-800 font-semibold bg-transparent"
                    placeholder="Admin Email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  New Admin Password
                </label>
                <div className="flex items-center border border-sky-100 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                  <Lock className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
                  <input
                    type="password"
                    value={editForm.adminPassword}
                    onChange={(e) => setEditForm(prev => ({ ...prev, adminPassword: e.target.value }))}
                    className="w-full focus:outline-none text-sm text-gray-800 font-semibold bg-transparent"
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">Leave password empty unless updating it.</p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-sky-50 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingOrg(null)}
                  className="px-4 py-2 border border-sky-200 text-gray-600 hover:bg-sky-50 font-bold rounded-lg text-xs transition-colors cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold py-2 px-5 rounded-lg flex items-center justify-center gap-1.5 hover:shadow-md transition-all duration-200 cursor-pointer text-xs"
                >
                  <Save className="w-4 h-4" /> {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Status/Remark Modal */}
      {deactivatingOrg && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-sky-100 max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-sky-50 pb-3">
              <h3 className="font-bold text-gray-800 text-base flex items-center gap-1.5">
                <Power className="w-5 h-5 text-red-500" /> Deactivate {deactivatingOrg.name}
              </h3>
              <button 
                onClick={() => setDeactivatingOrg(null)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-sky-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitDeactivation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Reason for Deactivation (Remark)
                </label>
                <textarea
                  rows="3"
                  value={deactivateRemark}
                  onChange={(e) => setDeactivateRemark(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-sky-100 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-gray-700"
                  placeholder="e.g. Payment pending, License expired, Contract ended"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-sky-50 mt-4">
                <button
                  type="button"
                  onClick={() => setDeactivatingOrg(null)}
                  className="px-4 py-2 border border-sky-200 text-gray-600 hover:bg-sky-50 font-bold rounded-lg text-xs transition-colors cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={togglingStatus}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg flex items-center justify-center gap-1.5 hover:shadow-md transition-all duration-200 cursor-pointer text-xs"
                >
                  Deactivate Instance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAdminDashboard;
