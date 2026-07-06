import { queryOptions } from "@tanstack/react-query";
import { accessControlService } from "../services/access-control.service";
export const accessKeys = { all: ["access-control"] as const, modules: () => ["access-control", "modules"] as const, roles: () => ["access-control", "roles"] as const, role: (id: string) => ["access-control", "roles", id] as const };
export const accessModulesOptions = () => queryOptions({ queryKey: accessKeys.modules(), queryFn: accessControlService.modules, staleTime: 60_000 });
export const accessRolesOptions = () => queryOptions({ queryKey: accessKeys.roles(), queryFn: accessControlService.roles, staleTime: 30_000 });
export const accessRoleOptions = (id: string) => queryOptions({ queryKey: accessKeys.role(id), queryFn: () => accessControlService.role(id), enabled: Boolean(id) });
