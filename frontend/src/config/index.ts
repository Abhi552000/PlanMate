import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";

const baseURL =
  ((import.meta as any).env?.VITE_ENDPOINT_HTTPS as string) ||
  "http://localhost:4000";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

let isRedirecting = false;

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest?.url?.includes("/login") ||
      originalRequest?.url?.includes("/register");

    // 1. Handle standard unauthenticated 401
    if (error?.response?.status === 401 && !isAuthRoute) {
      if (!isRedirecting) {
        isRedirecting = true;
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    // 2. Handle 403 Forbidden with SUBSCRIPTION_EXPIRED
    if (
      error?.response?.status === 403 &&
      error?.response?.data?.code === "SUBSCRIPTION_EXPIRED"
    ) {
      let currentUser: any = null;
      try {
        const stored = localStorage.getItem("currentUser");
        currentUser = stored ? JSON.parse(stored) : null;
      } catch {}

      if (currentUser?.role === "member") {
        if (!isRedirecting) {
          isRedirecting = true;
          const adminInfo = error?.response?.data?.admin;
          const noticePayload = {
            message:
              error?.response?.data?.message ||
              "Your organization subscription has expired. Please contact your workspace administrator to renew.",
            admin: adminInfo,
          };
          try {
            sessionStorage.setItem("expired_notice", JSON.stringify(noticePayload));
          } catch {}
          localStorage.removeItem("currentUser");
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } else if (currentUser?.role === "org_admin") {
        // Org Admin stays logged in so they can access Plans & Billing (/subscription) to renew
        try {
          if (!currentUser.isSubscriptionExpired) {
            currentUser.isSubscriptionExpired = true;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
          }
        } catch {}
        window.dispatchEvent(new CustomEvent("planmate:subscription_expired"));
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
