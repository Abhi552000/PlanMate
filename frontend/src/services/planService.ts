import axiosInstance from "../config";
import { API_ROUTES } from "../constants/routes";
import { IPlan } from "../types/organization";

export const planService = {
  // Get active plans (for Org Admin & Super Admin)
  getActivePlans: async (): Promise<{ success: boolean; plans: IPlan[] }> => {
    const { data } = await axiosInstance.get(API_ROUTES.PLANS.BASE);
    return data;
  },

  // Get all plans including inactive (Super Admin only)
  getAllPlansForAdmin: async (): Promise<{ success: boolean; plans: IPlan[] }> => {
    const { data } = await axiosInstance.get(API_ROUTES.PLANS.ADMIN_ALL);
    return data;
  },

  // Create a plan (Super Admin only)
  createPlan: async (planData: Partial<IPlan>): Promise<{ success: boolean; plan: IPlan; message: string }> => {
    const { data } = await axiosInstance.post(API_ROUTES.PLANS.BASE, planData);
    return data;
  },

  // Update a plan (Super Admin only)
  updatePlan: async (
    id: string,
    planData: Partial<IPlan>
  ): Promise<{ success: boolean; plan: IPlan; message: string }> => {
    const { data } = await axiosInstance.put(API_ROUTES.PLANS.BY_ID(id), planData);
    return data;
  },

  // Delete a plan (Super Admin only)
  deletePlan: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await axiosInstance.delete(API_ROUTES.PLANS.BY_ID(id));
    return data;
  },
};
