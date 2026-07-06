import "server-only";
import { http } from "@/lib/api/http";
import type { AccessModule, AccessPermissionInput, AccessRole, AccessUserRole } from "../types/access-control.types";

export const accessControlApi = {
  modules: (token: string) => http<AccessModule[]>("/parameters/access/modules", { method: "GET", token }),
  roles: (token: string) => http<AccessRole[]>("/parameters/access/roles", { method: "GET", token }),
  role: (roleId: string, token: string) => http<AccessRole>(`/parameters/access/roles/${roleId}`, { method: "GET", token }),
  createRole: (name: string, token: string) => http<AccessRole>("/parameters/access/roles", { method: "POST", token, body: JSON.stringify({ name }) }),
  replacePermissions: (roleId: string, permissions: AccessPermissionInput[], token: string) => http<AccessRole>(`/parameters/access/roles/${roleId}/permissions`, { method: "PUT", token, body: JSON.stringify({ permissions }) }),
  assignUserRole: (userId: string, roleId: string, token: string) => http<AccessUserRole>(`/parameters/access/users/${userId}/role`, { method: "PATCH", token, body: JSON.stringify({ roleId }) }),
};
