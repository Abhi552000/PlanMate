import axiosInstance from "../config";
import { API_ROUTES } from "../constants/routes";
import { IRole } from "../types";

export const roleService = {
  getRoles: async (): Promise<{ success: boolean; roles: IRole[] }> => {
    const { data } = await axiosInstance.get(API_ROUTES.ROLES.BASE);
    return data;
  },

  createRole: async (roleData: Partial<IRole>): Promise<{ success: boolean; role: IRole; message?: string }> => {
    const { data } = await axiosInstance.post(API_ROUTES.ROLES.BASE, roleData);
    return data;
  },

  updateRole: async (
    id: string,
    roleData: Partial<IRole>
  ): Promise<{ success: boolean; role: IRole; message?: string }> => {
    const { data } = await axiosInstance.put(API_ROUTES.ROLES.BY_ID(id), roleData);
    return data;
  },

  deleteRole: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const { data } = await axiosInstance.delete(API_ROUTES.ROLES.BY_ID(id));
    return data;
  },

  assignUserRole: async (
    userId: string,
    roleId: string | null
  ): Promise<{ success: boolean; message?: string; user?: any }> => {
    const { data } = await axiosInstance.put(API_ROUTES.ROLES.ASSIGN(userId), { roleId });
    return data;
  },
};
