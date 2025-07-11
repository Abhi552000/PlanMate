import axios from "axios";

const baseURL = import.meta.env.VITE_ENDPOINT_HTTPS || "http://localhost:4000";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    const isAuthRoute =
      originalRequest?.url?.includes("/login") ||
      originalRequest?.url?.includes("/register");

    if (error?.response?.status === 401 && !isAuthRoute) {
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
