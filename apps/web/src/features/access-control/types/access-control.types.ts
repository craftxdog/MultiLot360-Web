export type AccessModule = { id: string; code: string; description: string | null; roleCount: number };
export type AccessPermission = { moduleCode: string; moduleId: string; moduleDescription: string | null; canRead: boolean; canCreate: boolean; canUpdate: boolean; canDelete: boolean };
export type AccessRole = { id: string; name: string; createdAt: string; userCount: number; permissions: AccessPermission[] };
export type AccessPermissionInput = Pick<AccessPermission, "moduleCode" | "canRead" | "canCreate" | "canUpdate" | "canDelete">;
export type AccessUserRole = { userId: string; username: string; name: string | null; roleId: string; roleName: string; updatedAt: string };
