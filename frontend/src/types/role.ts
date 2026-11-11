export interface IRolePermissions {
  tickets: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
  boards: {
    create: boolean;
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
  sprints: {
    create: boolean;
    view: boolean;
    manage: boolean;
    delete: boolean;
  };
  team: {
    invite: boolean;
    view: boolean;
    approve: boolean;
    remove: boolean;
  };
  settings: {
    view: boolean;
    edit: boolean;
  };
  roles: {
    view: boolean;
    manage: boolean;
  };
}

export interface IRole {
  _id: string;
  name: string;
  description?: string;
  organization: string;
  isSystemDefault: boolean;
  permissions: IRolePermissions;
  assignedUserCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
