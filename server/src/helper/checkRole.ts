import { RoleOptions } from "../models/user";

export const isSuperAdmin = (roles: RoleOptions[]) =>
  roles.includes(RoleOptions.admin);
export const isAdmin = (roles: RoleOptions[]) =>
  roles.includes(RoleOptions.admin);
  export const isOperator = (roles: RoleOptions[]) =>
  roles.includes(RoleOptions.operator);