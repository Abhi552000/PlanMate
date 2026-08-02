import React, { useEffect, useState } from "react";
import { Building, Save, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../config";

const WorkspaceSettings = () => {
  const navigate = useNavigate();
  const [currentUser] = useState(() => {
    const stored = localStorage.getItem("currentUser");
    return stored ? JSON.parse(stored) : null;
  });

  const isOrgAdmin = currentUser?.role === "org_admin";

  const [orgData, setOrgData] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [savingOrg, setSavingOrg] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchOrgDetails = async () => {
    try {
      const { data } = await axiosInstance.get("/api/organization");
      if (data?.success && data?.organization) {
        setOrgData({
          name: data.organization.name || "",
          description: data.organization.description || "",
        });
      }
    } catch (err) {
      console.error("Error fetching org details:", err);
      setError("Failed to load workspace details.");
    }
  };

  useEffect(() => {
    if (!isOrgAdmin) {
      navigate("/");
      return;
    }
    const load = async () => {
      setLoading(true);
      await fetchOrgDetails();
      setLoading(false);
    };
    load();
  }, [isOrgAdmin, navigate]);

  const handleOrgChange = (e) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateOrg = async (e) => {
    e.preventDefault();
    setSavingOrg(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const { data } = await axiosInstance.put("/api/organization", orgData);
      if (data?.success) {
        setSuccessMsg("Workspace settings updated successfully!");
        // Update stored workspace name if present
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            organizationName: orgData.name,
          };
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "Failed to update workspace settings."
      );
    } finally {
      setSavingOrg(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-10 h-10 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-semibold">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100/50 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-xl text-white shadow-md">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Workspace Settings
            </h1>
            <p className="text-xs font-semibold text-gray-400">
              Configure name, description, branding and details of your team
              space.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-650 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/50 animate-fadeIn">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="text-sm text-green-700 dark:text-green-450 bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-100 dark:border-green-900/50 font-medium animate-fadeIn">
          {successMsg}
        </div>
      )}

      {/* Settings Form */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-250 flex items-center gap-2 border-b border-sky-55 dark:border-gray-800 pb-3">
          <Building className="w-4.5 h-4.5 text-sky-500" /> Workspace Branding
        </h3>

        <form onSubmit={handleUpdateOrg} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              name="name"
              value={orgData.name}
              onChange={handleOrgChange}
              className="w-full px-3.5 py-2.5 border border-sky-100 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 font-semibold text-gray-800 dark:text-gray-200"
              placeholder="e.g. TCS Solutions, Pepsi Co"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Workspace Description
            </label>
            <textarea
              name="description"
              value={orgData.description}
              onChange={handleOrgChange}
              rows="4"
              className="w-full px-3.5 py-2.5 border border-sky-100 dark:border-gray-800 rounded-lg text-sm bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-gray-750 dark:text-gray-300"
              placeholder="Define the scope, goals and branding guidelines of this workspace..."
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingOrg}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:shadow-md transition-all duration-200 cursor-pointer text-sm disabled:opacity-50"
            >
              <Save className="w-4.5 h-4.5" />{" "}
              {savingOrg ? "Saving Settings..." : "Save Workspace Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkspaceSettings;
