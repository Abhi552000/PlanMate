import axiosInstance from "../config";
import { API_ROUTES } from "../constants/routes";

export const orgService = {
  getOrgDetails: async () => {
    const { data } = await axiosInstance.get(API_ROUTES.ORGANIZATION.BASE);
    return data;
  },
  updateOrgDetails: async (orgData: any) => {
    const { data } = await axiosInstance.put(API_ROUTES.ORGANIZATION.BASE, orgData);
    return data;
  },
  getOrgMembers: async () => {
    const { data } = await axiosInstance.get(API_ROUTES.ORGANIZATION.MEMBERS);
    return data;
  },
  getOrgUsers: async (params?: URLSearchParams) => {
    const url = params ? `${API_ROUTES.ORGANIZATION.USERS}?${params.toString()}` : API_ROUTES.ORGANIZATION.USERS;
    const { data } = await axiosInstance.get(url);
    return data;
  },
  updateUserStatus: async (userId: string, status: string) => {
    const { data } = await axiosInstance.put(API_ROUTES.ORGANIZATION.USER_STATUS_UPDATE(userId), { status });
    return data;
  },
  addOrgMember: async (memberData: any) => {
    const { data } = await axiosInstance.post(API_ROUTES.ORGANIZATION.MEMBERS, memberData);
    return data;
  },
  addCustomStatus: async (status: string) => {
    const { data } = await axiosInstance.post(API_ROUTES.ORGANIZATION.STATUSES, { status });
    return data;
  },
  deleteCustomStatus: async (statusName: string) => {
    const { data } = await axiosInstance.delete(API_ROUTES.ORGANIZATION.STATUS_DELETE(statusName));
    return data;
  },
  getSystemAdminOrgs: async () => {
    const { data } = await axiosInstance.get("/api/organization/all");
    return data;
  },
  onboardOrg: async (orgData: any) => {
    const { data } = await axiosInstance.post("/api/organization/onboard", orgData);
    return data;
  },
  updateOrgAdmin: async (orgId: string, adminData: any) => {
    const { data } = await axiosInstance.put(API_ROUTES.ORGANIZATION.ADMIN_BY_ID(orgId), adminData);
    return data;
  },
  updateOrgStatus: async (orgId: string, statusData: any) => {
    const { data } = await axiosInstance.put(API_ROUTES.ORGANIZATION.STATUS_BY_ID(orgId), statusData);
    return data;
  },
  deleteOrg: async (orgId: string) => {
    const { data } = await axiosInstance.delete(API_ROUTES.ORGANIZATION.DELETE_BY_ID(orgId));
    return data;
  },
  getPublicOrgs: async () => {
    const { data } = await axiosInstance.get(API_ROUTES.ORGANIZATION.PUBLIC_LIST);
    return data;
  },
};
