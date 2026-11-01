import axiosInstance from "../config";
import { API_ROUTES } from "../constants/routes";
import { ISprint, IEpic } from "../types";

export const backlogService = {
  // SPRINTS
  getSprints: async (params?: URLSearchParams): Promise<{ success: boolean; sprints: ISprint[]; backlogTasks: any[] }> => {
    const url = params && params.toString() ? `${API_ROUTES.SPRINTS.BASE}?${params.toString()}` : API_ROUTES.SPRINTS.BASE;
    const { data } = await axiosInstance.get(url);
    return data;
  },
  createSprint: async (sprintData: { name: string; startDate?: string; endDate?: string; goal?: string }): Promise<ISprint> => {
    const { data } = await axiosInstance.post(API_ROUTES.SPRINTS.BASE, sprintData);
    return data.sprint;
  },
  updateSprint: async (id: string, sprintData: { name?: string; startDate?: string; endDate?: string; goal?: string; status?: "planned" | "active" | "completed" | "closed" }): Promise<ISprint> => {
    const { data } = await axiosInstance.put(API_ROUTES.SPRINTS.BY_ID(id), sprintData);
    return data.sprint;
  },
  deleteSprint: async (id: string): Promise<string> => {
    await axiosInstance.delete(API_ROUTES.SPRINTS.BY_ID(id));
    return id;
  },

  // EPICS
  getEpics: async (): Promise<{ success: boolean; epics: IEpic[] }> => {
    const { data } = await axiosInstance.get(API_ROUTES.EPICS.BASE);
    return data;
  },
  createEpic: async (epicData: { name: string; color?: string; description?: string }): Promise<IEpic> => {
    const { data } = await axiosInstance.post(API_ROUTES.EPICS.BASE, epicData);
    return data.epic;
  },
  updateEpic: async (id: string, epicData: { name?: string; color?: string; description?: string }): Promise<IEpic> => {
    const { data } = await axiosInstance.put(API_ROUTES.EPICS.BY_ID(id), epicData);
    return data.epic;
  },
  deleteEpic: async (id: string): Promise<string> => {
    await axiosInstance.delete(API_ROUTES.EPICS.BY_ID(id));
    return id;
  },
};
