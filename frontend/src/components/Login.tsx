import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../services/authService";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

const INITIAL_FORM = { email: "", password: "" };

import { LoginProps } from "../types";

export const Login: React.FC<LoginProps> = ({ onSubmit, onSwitchMode }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token) {
      (async () => {
        try {
          const data = await authService.getMe();
          if (data.success) {
            onSubmit?.({ token, userId, ...data.user });
            toast.success("Session restored. Redirecting...");
            const targetPath = data.user.role === "system_admin" ? "/system-admin" : "/";
            navigate(targetPath);
          } else {
            localStorage.clear();
          }
        } catch {
          localStorage.clear();
        }
      })();
    }
  }, [navigate, onSubmit]);

  const handleSwitchMode = () => {
    toast.dismiss();
    onSwitchMode?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rememberMe) {
      toast.error('You must enable "Remember Me" to login');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.login(formData);
      if (!data.token) throw new Error(data.message || "Login Failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      setFormData(INITIAL_FORM);
      onSubmit?.({ token: data.token, userId: data.user.id, ...data.user });
      toast.success("Login successfull Redirecting...");
      const targetPath = data.user.role === "system_admin" ? "/system-admin" : "/";
      setTimeout(() => navigate(targetPath), 1000);
    } catch (err: any) {
      console.log("err", err);
      const msg =
        err?.response?.data?.message || err?.message || "Login failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" max-w-md w-full bg-white shadow-lg border border-sky-100 rounded-xl p-8">
      <div className=" mb-6 text-center">
        <div className=" w-16 h-16 bg-gradient-to-br from-cyan-500 to-sky-600 rounded-full mx-auto flex items-center justify-center mb-4">
          <LogIn className=" w-8 h-8 text-white" />
        </div>
        <h2 className=" text-2xl font-bold text-gray-800"> Welcome Back</h2>
        <p className=" text-gray-500 text-sm mt-1">
          Sign in to continue to PlanMate
        </p>
      </div>
      <form onSubmit={handleSubmit} className=" space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          icon={<Mail className="w-5 h-5" />}
          required
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            icon={<Lock className="w-5 h-5" />}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[13px] text-gray-500 hover:text-sky-500 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className=" w-5 h-5" />
            ) : (
              <Eye className=" w-5 h-5" />
            )}
          </button>
        </div>

        <div className=" flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className=" h-4 w-4 text-sky-500 focus:ring-sky-400 border-gray-300 rounded cursor-pointer"
            required
          />
          <label
            htmlFor="rememberMe"
            className=" ml-2 block text-sm text-gray-700 cursor-pointer select-none"
          >
            Remember Me
          </label>
        </div>
        <Button type="submit" className="w-full" loading={loading} icon={<LogIn className="w-4 h-4" />}>
          Login In
        </Button>
      </form>
      <p className=" text-center text-xs text-gray-500 mt-6 font-medium">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={handleSwitchMode}
          className=" text-sky-600 hover:text-sky-700 hover:underline font-bold transition-colors cursor-pointer"
        >
          Request Access
        </button>
      </p>
    </div>
  );
};

export default Login;
