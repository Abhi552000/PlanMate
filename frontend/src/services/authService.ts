import axiosInstance from "../config";
import { API_ROUTES } from "../constants/routes";

export const authService = {
  login: async (credentials: any) => {
    const { data } = await axiosInstance.post(API_ROUTES.AUTH.LOGIN, credentials);
    return data;
  },
  getMe: async () => {
    const { data } = await axiosInstance.get(API_ROUTES.AUTH.ME);
    return data;
  },
  updateProfile: async (profileData: { name: string; email: string }) => {
    const { data } = await axiosInstance.put(API_ROUTES.AUTH.PROFILE, profileData);
    return data;
  },
  changePassword: async (passwordData: any) => {
    const { data } = await axiosInstance.put(API_ROUTES.AUTH.PASSWORD, passwordData);
    return data;
  },
  register: async (signupData: any) => {
    const { data } = await axiosInstance.post(API_ROUTES.AUTH.REGISTER, signupData);
    return data;
  },
};
