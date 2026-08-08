import axiosInstance from "../config";
import { API_ROUTES } from "../constants/routes";
import { INotification } from "../types";

export const notificationService = {
  getNotifications: async (): Promise<{ success: boolean; notifications: INotification[] }> => {
    const { data } = await axiosInstance.get(API_ROUTES.NOTIFICATIONS.BASE);
    return data;
  },
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const { data } = await axiosInstance.put(API_ROUTES.NOTIFICATIONS.READ_ALL);
    return data;
  },
  markAsRead: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await axiosInstance.put(API_ROUTES.NOTIFICATIONS.READ_BY_ID(id));
    return data;
  },
};
