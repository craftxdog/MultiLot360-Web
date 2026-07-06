import { browserHttp } from "@/lib/api/browser-http";
import type { AccessModule, AccessPermissionInput, AccessRole, AccessUserRole } from "../types/access-control.types";
const json = { "Content-Type": "application/json" };
export const accessControlService = {
  modules: () => browserHttp<AccessModule[]>("/api/access/modules"),
  roles: () => browserHttp<AccessRole[]>("/api/access/roles"),
  role: (roleId: string) => browserHttp<AccessRole>(`/api/access/roles/${roleId}`),
  createRole: (name: string) => browserHttp<AccessRole>("/api/access/roles", { method: "POST", headers: json, body: JSON.stringify({ name }) }),
  replacePermissions: ({ roleId, permissions }: { roleId: string; permissions: AccessPermissionInput[] }) => browserHttp<AccessRole>(`/api/access/roles/${roleId}/permissions`, { method: "PUT", headers: json, body: JSON.stringify({ permissions }) }),
  assignUserRole: ({ userId, roleId }: { userId: string; roleId: string }) => browserHttp<AccessUserRole>(`/api/access/users/${userId}/role`, { method: "PATCH", headers: json, body: JSON.stringify({ roleId }) }),
};
