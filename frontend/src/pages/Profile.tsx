import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  ChevronLeft,
  Lock,
  LogOut,
  Mail,
  Save,
  Shield,
  User,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { ProfileProps } from "../types";

const Profile: React.FC<ProfileProps> = ({ setCurrentUser, onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profile, setProfile] = useState<{ name: string; email: string }>({
    name: "",
    email: "",
  });
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe()
      .then((data) => {
        if (data.success && data.user) {
          setProfile({ name: data.user.name || "", email: data.user.email || "" });
        } else {
          toast.error(data.message || "Failed to load profile details");
        }
      })
      .catch(() => toast.error("Unable to load the profile"))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = profile.name?.trim();
    if (!trimmedName) {
      return toast.error("Full name cannot be empty");
    }
    if (trimmedName.length < 2) {
      return toast.error("Full name must be at least 2 characters");
    }

    setSavingProfile(true);
    try {
      const data = await authService.updateProfile({
        name: trimmedName,
        email: profile.email,
      });

      if (data.success) {
        setCurrentUser((prev: any) => ({
          ...prev,
          name: trimmedName,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            trimmedName
          )}&background=random`,
        }));
        toast.success("Profile Updated Successfully");
      } else {
        toast.error(data.message || "Profile update failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Profile update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.current) {
      return toast.error("Current password is required");
    }
    if (!password.new) {
      return toast.error("New password is required");
    }
    if (password.new.length < 8) {
      return toast.error("New password must be at least 8 characters long");
    }
    if (password.new === password.current) {
      return toast.error("New password must be different from current password");
    }
    if (password.new !== password.confirm) {
      return toast.error("New password and confirm password do not match");
    }

    setChangingPassword(true);
    try {
      const data = await authService.changePassword({
        currentPassword: password.current,
        newPassword: password.new,
      });

      if (data.success) {
        toast.success("Password Changed Successfully");
        setPassword({ current: "", new: "", confirm: "" });
      } else {
        toast.error(data.message || "Password change failed");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Password change failed");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-6 font-sans px-4 sm:px-6 py-6 animate-pulse select-none">
        <div className="h-6 w-32 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-2">
          <div className="h-8 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-80 rounded bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="grid md:grid-cols-2 gap-6 pt-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 p-6 space-y-4"
            >
              <div className="h-6 w-40 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-3 pt-2">
                <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-sans px-4 sm:px-6 py-4 sm:py-6">
      {/* Top Navigation & Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-sky-400 mb-3 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Account Settings
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your personal information, email address, and security credentials
            </p>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <form onSubmit={saveProfile} className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-base shrink-0 border border-sky-100 dark:border-sky-900/50">
                  {initial}
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    Personal Information
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Update your display name and view email
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingProfile ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Save
              </button>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="profile-name"
                  className="block text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    className="w-full h-10 pl-10 pr-3 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="profile-email"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-300"
                  >
                    Email Address
                  </label>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                    Read-only
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="profile-email"
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full h-10 pl-10 pr-3 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/50 border border-slate-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Your email address is managed through your organization account.
                </p>
              </div>
            </div>
          </form>
        </section>

        {/* Security & Password */}
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
          <form onSubmit={changePassword} className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 border border-amber-100 dark:border-amber-900/50">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    Password & Security
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Change and strengthen your account password
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPassword ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Update
              </button>
            </div>

            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="current-password"
                  className="block text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="current-password"
                    type="password"
                    required
                    value={password.current}
                    onChange={(e) =>
                      setPassword({ ...password, current: e.target.value })
                    }
                    placeholder="Enter current password"
                    className="w-full h-10 pl-10 pr-3 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition-all"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="new-password"
                  className="block text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="new-password"
                    type="password"
                    required
                    value={password.new}
                    onChange={(e) =>
                      setPassword({ ...password, new: e.target.value })
                    }
                    placeholder="Minimum 8 characters"
                    className="w-full h-10 pl-10 pr-3 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    value={password.confirm}
                    onChange={(e) =>
                      setPassword({ ...password, confirm: e.target.value })
                    }
                    placeholder="Re-enter new password"
                    className="w-full h-10 pl-10 pr-3 text-xs sm:text-sm bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15 transition-all"
                  />
                </div>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile;
