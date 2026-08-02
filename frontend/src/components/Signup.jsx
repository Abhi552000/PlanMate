import React, { useEffect, useState } from "react";
import { UserPlus, ArrowLeft, Building, User, Mail, Lock, Check } from "lucide-react";
import axiosInstance from "../config";

const Signup = ({ onSwitchMode }) => {
  const [organizations, setOrganizations] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organization: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const { data } = await axiosInstance.get("/api/organization/public-list");
        if (data?.success && data?.organizations) {
          setOrganizations(data.organizations);
        }
      } catch (err) {
        console.error("Error fetching organizations list:", err);
      }
    };
    fetchOrgs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.organization) {
      setError("Please fill in all details, including organization.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data } = await axiosInstance.post("/api/user/register", formData);
      if (data?.success) {
        setSuccessMessage(data.message || "Registration request submitted successfully!");
        setFormData({ name: "", email: "", password: "", organization: "" });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" max-w-md w-full bg-white shadow-lg border border-sky-100 rounded-xl p-8 space-y-5">
      <div className="text-center">
        <div className=" w-14 h-14 bg-gradient-to-r from-cyan-500 to-sky-600 rounded-full mx-auto flex items-center justify-center mb-3">
          <UserPlus className=" w-7 h-7 text-white" />
        </div>
        <h2 className=" text-2xl font-bold text-gray-800">Create Account</h2>
        <p className=" text-gray-400 text-xs mt-1">
          Join your organization's PlanMate workspace
        </p>
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 font-medium animate-fadeIn">
          {error}
        </div>
      )}

      {successMessage ? (
        <div className="space-y-4 py-2 text-center animate-fadeIn">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-200">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-xs text-green-800 bg-green-50/50 p-4 rounded-xl border border-green-100 font-bold leading-relaxed">
            {successMessage}
          </p>
          <button
            type="button"
            onClick={onSwitchMode}
            className="w-full bg-gradient-to-r cursor-pointer from-cyan-500 to-sky-600 text-white text-xs font-semibold py-2.5 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className=" space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Full Name
            </label>
            <div className="flex items-center border border-sky-100 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
              <User className="w-4.5 h-4.5 text-sky-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full focus:outline-none text-xs text-gray-800 font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Email Address
            </label>
            <div className="flex items-center border border-sky-100 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
              <Mail className="w-4.5 h-4.5 text-sky-500 mr-2 shrink-0" />
              <input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full focus:outline-none text-xs text-gray-800 font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Password
            </label>
            <div className="flex items-center border border-sky-100 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
              <Lock className="w-4.5 h-4.5 text-sky-500 mr-2 shrink-0" />
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full focus:outline-none text-xs text-gray-800 font-semibold"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Select Workspace Organization
            </label>
            <div className="flex items-center border border-sky-100 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
              <Building className="w-4.5 h-4.5 text-sky-500 mr-2 shrink-0" />
              <select
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full focus:outline-none text-xs text-gray-800 font-bold bg-transparent cursor-pointer"
                required
              >
                <option value="">Choose your company...</option>
                {organizations.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r cursor-pointer from-cyan-500 to-sky-600 text-white text-xs font-bold py-2.5 rounded-lg hover:shadow-md transition-all duration-200"
          >
            {loading ? "Registering..." : "Submit Access Request"}
          </button>
          
          <p className=" text-center text-xs text-gray-500 mt-4">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchMode}
              className=" text-sky-600 hover:text-sky-700 hover:underline font-bold transition-colors cursor-pointer"
            >
              Log In
            </button>
          </p>
        </form>
      )}
    </div>
  );
};

export default Signup;
