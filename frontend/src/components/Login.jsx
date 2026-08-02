import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { BUTTON_CLASSES, INPUTWRAPPER } from "../assets/dummy";
import axiosInstance from "../config";

const INITIAL_FORM = { email: "", password: "" };

const Login = ({ onSubmit, onSwitchMode }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const fields = [
    { name: "email", type: "email", placeholder: "Email", icon: Mail },
    {
      name: "password",
      type: showPassword ? "text" : "password",
      placeholder: "Password",
      icon: Lock,
      isPassword: true,
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token) {
      (async () => {
        try {
          const { data } = await axiosInstance.get("/api/user/me");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rememberMe) {
      toast.error('You must enable "Remember Me" to login');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/api/user/login", formData);
      if (!data.token) throw new Error(data.message || "Login Failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      setFormData(INITIAL_FORM);
      onSubmit?.({ token: data.token, userId: data.user.id, ...data.user });
      toast.success("Login successfull Redirecting...");
      const targetPath = data.user.role === "system_admin" ? "/system-admin" : "/";
      setTimeout(() => navigate(targetPath), 1000);
    } catch (err) {
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
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
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
        {fields.map(({ name, type, placeholder, icon: Icon, isPassword }) => (
          <div key={name} className={INPUTWRAPPER}>
            <Icon className=" text-sky-500 w-5 h-5 mr-2" />
            <input
              type={type}
              placeholder={placeholder}
              value={formData[name]}
              onChange={(e) =>
                setFormData({ ...formData, [name]: e.target.value })
              }
              className=" w-full focus:outline-none text-sm text-gray-700"
              required
            />
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className=" ml-2 text-gray-500 hover:text-sky-500 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className=" w-5 h-5" />
                ) : (
                  <Eye className=" w-5 h-5" />
                )}
              </button>
            )}
          </div>
        ))}

        <div className=" flex items-center">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className=" h-4 w-4 text-sky-500 focus:ring-sky-400 border-gray-300 rounded "
            required
          />
          <label
            htmlFor="rememberMe"
            className=" ml-2 block text-sm text-gray-700"
          >
            Remember Me
          </label>
        </div>
        <button type="submit" className={BUTTON_CLASSES} disabled={loading}>
          {loading ? (
            "Logging in..."
          ) : (
            <>
              <LogIn className=" w-4 h-4" />
              Login In
            </>
          )}
        </button>
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
