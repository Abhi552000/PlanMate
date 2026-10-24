import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../services/authService";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { TOAST_MESSAGES } from "../constants/messages";
import { AUTH_TEXTS } from "../constants/uiTexts";
import { PlanMateLogo } from "./common/PlanMateLogo";

const INITIAL_FORM = { email: "", password: "" };

import { LoginProps } from "../types";

export const Login: React.FC<LoginProps> = ({ onSubmit, onSwitchMode }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
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
            toast.success(TOAST_MESSAGES.AUTH_SESSION_RESTORED);
            const targetPath =
              data.user.role === "system_admin" ? "/system-admin" : "/";
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
    setLoading(true);
    try {
      const data = await authService.login(formData);
      if (!data.token)
        throw new Error(data.message || TOAST_MESSAGES.AUTH_LOGIN_FAILED);

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      setFormData(INITIAL_FORM);
      onSubmit?.({ token: data.token, userId: data.user.id, ...data.user });
      toast.success(TOAST_MESSAGES.AUTH_LOGIN_SUCCESS);
      const targetPath =
        data.user.role === "system_admin" ? "/system-admin" : "/";
      setTimeout(() => navigate(targetPath), 1000);
    } catch (err: any) {
      console.log("err", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        TOAST_MESSAGES.AUTH_LOGIN_FAILED;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white dark:bg-gray-900 shadow-2xl shadow-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 sm:p-8 my-auto">
      <div className="mb-6 text-center">
        <div className="flex justify-center mb-4">
          <PlanMateLogo size={56} />
        </div>
        <h2 className=" text-2xl font-bold text-gray-800">
          {" "}
          {AUTH_TEXTS.LOGIN_WELCOME}
        </h2>
        <p className=" text-gray-500 text-sm mt-1">
          {AUTH_TEXTS.LOGIN_SUBTITLE}
        </p>
      </div>
      <form onSubmit={handleSubmit} className=" space-y-4">
        <Input
          type="email"
          placeholder={AUTH_TEXTS.LOGIN_INPUT_EMAIL}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          icon={<Mail className="w-5 h-5" />}
          required
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={AUTH_TEXTS.LOGIN_INPUT_PASSWORD}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
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

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          icon={<LogIn className="w-4 h-4" />}
        >
          {AUTH_TEXTS.LOGIN_BTN}
        </Button>
      </form>
      <p className=" text-center text-xs text-gray-500 mt-6 font-medium">
        {AUTH_TEXTS.LOGIN_NO_ACCOUNT}{" "}
        <button
          type="button"
          onClick={handleSwitchMode}
          className=" text-sky-600 hover:text-sky-700 hover:underline font-bold transition-colors cursor-pointer"
        >
          {AUTH_TEXTS.LOGIN_BTN_REQUEST}
        </button>
      </p>
    </div>
  );
};

export default Login;
