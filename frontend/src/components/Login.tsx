import { Eye, EyeOff, Lock, LogIn, Mail, AlertCircle, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../services/authService";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { TOAST_MESSAGES } from "../constants/messages";
import { AUTH_TEXTS, SUBSCRIPTION_EXPIRED_TEXTS } from "../constants/uiTexts";
import { PlanMateLogo } from "./common/PlanMateLogo";

const INITIAL_FORM = { email: "", password: "" };

import { LoginProps } from "../types";

export const Login: React.FC<LoginProps> = ({ onSubmit, onSwitchMode }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [expiredNotice, setExpiredNotice] = useState<{
    message: string;
    admin?: { name: string; email: string };
  } | null>(null);

  useEffect(() => {
    const savedNotice = sessionStorage.getItem("expired_notice");
    if (savedNotice) {
      try {
        setExpiredNotice(JSON.parse(savedNotice));
      } catch {
        setExpiredNotice({ message: savedNotice });
      }
      sessionStorage.removeItem("expired_notice");
    }

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
    setExpiredNotice(null);
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
      const resData = err?.response?.data;
      if (
        resData?.code === "SUBSCRIPTION_EXPIRED" ||
        resData?.message?.toLowerCase().includes("subscription has expired")
      ) {
        setExpiredNotice({
          message: resData.message || SUBSCRIPTION_EXPIRED_TEXTS.MEMBER_LOGIN_SUBTITLE,
          admin: resData.admin,
        });
      } else {
        const msg =
          resData?.message ||
          err?.message ||
          TOAST_MESSAGES.AUTH_LOGIN_FAILED;
        toast.error(msg);
      }
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

      {expiredNotice && (
        <div className="mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-left animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                {SUBSCRIPTION_EXPIRED_TEXTS.MEMBER_LOGIN_TITLE}
              </h3>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-1 leading-relaxed">
                {expiredNotice.message}
              </p>
              {expiredNotice.admin?.name && (
                <div className="mt-2.5 pt-2 border-t border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex flex-col gap-0.5">
                  <span className="font-medium text-[11px] text-amber-700 dark:text-amber-400">
                    {SUBSCRIPTION_EXPIRED_TEXTS.MEMBER_ADMIN_CONTACT_TITLE}
                  </span>
                  <div className="flex items-center gap-1.5 font-medium flex-wrap">
                    <span>{expiredNotice.admin.name}</span>
                    {expiredNotice.admin.email && (
                      <>
                        <span className="text-amber-500/60">•</span>
                        <a
                          href={`mailto:${expiredNotice.admin.email}`}
                          className="text-sky-600 dark:text-sky-400 hover:underline font-mono"
                        >
                          {expiredNotice.admin.email}
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setExpiredNotice(null)}
              className="text-amber-600/70 hover:text-amber-800 dark:text-amber-400/70 dark:hover:text-amber-200 p-0.5"
              aria-label={SUBSCRIPTION_EXPIRED_TEXTS.MEMBER_DISMISS}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
