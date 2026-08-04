export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "org_admin" | "member" | "system_admin";
  status: "active" | "pending" | "rejected";
  avatar?: string;
  organization?: string | any;
  organizationName?: string;
}
