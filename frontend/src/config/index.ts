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

    if (error?.response?.status === 401 && !isAuthRoute) {
      if (!isRedirecting) {
        isRedirecting = true;
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
