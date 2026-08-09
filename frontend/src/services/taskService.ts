import axiosInstance from "../config";
import { API_ROUTES } from "../constants/routes";

export const taskService = {
  getTasks: async (params?: URLSearchParams) => {
    const url = params ? `${API_ROUTES.TASKS.BASE}?${params.toString()}` : API_ROUTES.TASKS.BASE;
    const { data } = await axiosInstance.get(url);
    return data;
  },
  getTaskById: async (id: string) => {
    const { data } = await axiosInstance.get(API_ROUTES.TASKS.BY_ID(id));
    return data;
  },
  createTask: async (taskData: any) => {
    const { data } = await axiosInstance.post(API_ROUTES.TASKS.BASE, taskData);
    return data;
  },
  updateTask: async (id: string, taskData: any) => {
    const { data } = await axiosInstance.put(API_ROUTES.TASKS.BY_ID(id), taskData);
    return data;
  },
  deleteTask: async (id: string) => {
    const { data } = await axiosInstance.delete(API_ROUTES.TASKS.BY_ID(id));
    return data;
  },
  getAnalytics: async () => {
    const { data } = await axiosInstance.get(API_ROUTES.TASKS.ANALYTICS);
    return data;
  },
  addComment: async (id: string, text: string) => {
    const { data } = await axiosInstance.post(API_ROUTES.TASKS.ADD_COMMENT(id), { text });
    return data;
  },
  deleteComment: async (id: string, commentId: string) => {
    const { data } = await axiosInstance.delete(API_ROUTES.TASKS.DELETE_COMMENT(id, commentId));
    return data;
  },
  logWork: async (id: string, hoursSpent: number, description?: string) => {
    const { data } = await axiosInstance.post(API_ROUTES.TASKS.LOG_WORK(id), { hoursSpent, description });
    return data;
  },
};
