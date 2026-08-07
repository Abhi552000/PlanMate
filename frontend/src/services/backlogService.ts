import axiosInstance from "../config";

export const backlogService = {
  // SPRINTS
  getSprints: async () => {
    const { data } = await axiosInstance.get("/api/sprints");
    return data;
  },
  createSprint: async (sprintData: { name: string; startDate?: string; endDate?: string; goal?: string }) => {
    const { data } = await axiosInstance.post("/api/sprints", sprintData);
    return data;
  },
  updateSprint: async (id: string, sprintData: { name?: string; startDate?: string; endDate?: string; goal?: string; status?: "planned" | "active" | "completed" }) => {
    const { data } = await axiosInstance.put(`/api/sprints/${id}`, sprintData);
    return data;
  },
  deleteSprint: async (id: string) => {
    const { data } = await axiosInstance.delete(`/api/sprints/${id}`);
    return data;
  },

  // EPICS
  getEpics: async () => {
    const { data } = await axiosInstance.get("/api/epics");
    return data;
  },
  createEpic: async (epicData: { name: string; color?: string; description?: string }) => {
    const { data } = await axiosInstance.post("/api/epics", epicData);
    return data;
  },
  updateEpic: async (id: string, epicData: { name?: string; color?: string; description?: string }) => {
    const { data } = await axiosInstance.put(`/api/epics/${id}`, epicData);
    return data;
  },
  deleteEpic: async (id: string) => {
    const { data } = await axiosInstance.delete(`/api/epics/${id}`);
    return data;
  },
};
