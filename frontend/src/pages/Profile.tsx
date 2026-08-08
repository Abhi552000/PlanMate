import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  BACK_BUTTON,
  personalFields,
  SECTION_WRAPPER,
  securityFields,
} from "../assets/dummy";
import {
  ChevronLeft,
  Lock,
  LogOut,
  Save,
  Shield,
  UserCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { IUser, ProfileProps } from "../types";

const Profile: React.FC<ProfileProps> = ({ setCurrentUser, onLogout }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Record<string, string>>({
    name: "",
    email: "",
  });
  const [password, setPassword] = useState<Record<string, string>>({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    authService
      .getMe()
      .then((data) => {
        if (data.success)
          setProfile({ name: data.user.name, email: data.user.email });
        else toast.error(data.message);
      })
      .catch(() => toast.error("Unable to load the profile"));
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await authService.updateProfile({
        name: profile.name,
        email: profile.email,
      });

      if (data.success) {
        setCurrentUser((prev: any) => ({
          ...prev,
          name: profile.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            profile.name
          )}&background=random`,
        }));
        toast.success("Profile Updated");
      } else toast.error(data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Profile update failed");
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      return toast.error("Password do not match");
    }
    try {
      const data = await authService.changePassword({
        currentPassword: password.current,
        newPassword: password.new,
      });

      if (data.success) {
        toast.success("Password Changed");
        setPassword({ current: "", new: "", confirm: "" });
      } else toast.error(data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Password change failed");
    }
  };

  return (
    <div className="w-full space-y-6 font-sans">
      <button onClick={() => navigate(-1)} className={BACK_BUTTON}>
        <ChevronLeft className=" w-5 h-5 mr-1" />
        Back to Dashboard
      </button>
      <div className=" flex items-center gap-4 mb-8">
        <div
          className=" w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600
 flex items-center justify-center text-white text-2xl font-bold shadow-md"
        >
          {profile.name ? profile.name[0].toUpperCase() : "U"}
        </div>
        <div>
          <h1 className=" text-3xl font-bold text-gray-800 dark:text-gray-200">
            Account Settings
          </h1>
          <p className=" text-gray-500 dark:text-gray-400 text-sm">
            Manage your profile and security settings
          </p>
        </div>
      </div>
      <div className=" grid md:grid-cols-2 gap-8">
        <section
          className={`${SECTION_WRAPPER} dark:bg-gray-900 dark:border-gray-800`}
        >
          <form onSubmit={saveProfile} className=" space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <UserCircle className=" text-sky-500 w-5 h-5" />
                <h2 className=" text-xl font-semibold text-gray-850 dark:text-gray-250">
                  Personal Information
                </h2>
              </div>
              <Button
                type="submit"
                size="sm"
                icon={<Save className="w-4 h-4" />}
              >
                Save
              </Button>
            </div>

            {personalFields.map(({ name, type, placeholder, icon: Icon }) => (
              <Input
                key={name}
                type={type}
                placeholder={placeholder}
                value={profile[name] || ""}
                onChange={(e) =>
                  setProfile({ ...profile, [name]: e.target.value })
                }
                icon={<Icon className="w-5 h-5 text-sky-500" />}
                required
                disabled={name === "email"}
              />
            ))}
          </form>
        </section>
        <section
          className={`${SECTION_WRAPPER} dark:bg-gray-900 dark:border-gray-800`}
        >
          <form onSubmit={changePassword} className=" space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield className=" text-sky-500 w-5 h-5" />
                <h2 className=" text-xl font-semibold text-gray-850 dark:text-gray-250">
                  Security
                </h2>
              </div>
              <Button
                type="submit"
                size="sm"
                icon={<Shield className="w-4 h-4" />}
              >
                Save
              </Button>
            </div>

            {securityFields.map(({ name, placeholder }) => (
              <Input
                key={name}
                type="password"
                placeholder={placeholder}
                value={password[name] || ""}
                onChange={(e) =>
                  setPassword({ ...password, [name]: e.target.value })
                }
                icon={<Lock className="w-5 h-5 text-sky-500" />}
                required
              />
            ))}

            <div className=" mt-8 pt-6 border-t border-sky-100 dark:border-gray-800">
              <Button
                type="button"
                variant="danger"
                className="w-full"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Profile;
