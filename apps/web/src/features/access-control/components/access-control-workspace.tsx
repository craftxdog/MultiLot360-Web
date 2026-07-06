"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Plus, Save, ShieldCheck, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { UserEntityCombobox } from "@/features/shared/components/api-entity-comboboxes";
import { accessKeys, accessModulesOptions, accessRoleOptions, accessRolesOptions } from "../queries/access-control.queries";
import { accessControlService } from "../services/access-control.service";
import type { AccessModule, AccessPermissionInput, AccessRole } from "../types/access-control.types";

const actions = [{ key: "canRead", label: "Leer" }, { key: "canCreate", label: "Crear" }, { key: "canUpdate", label: "Editar" }, { key: "canDelete", label: "Eliminar" }] as const;

function RolePermissionsEditor({ roleId, canUpdate, modules, role }: { roleId: string; canUpdate: boolean; modules: AccessModule[]; role: AccessRole }) {
  const client = useQueryClient();
  const [permissions, setPermissions] = useState<AccessPermissionInput[]>(() => modules.map((module) => {
      const current = role.permissions.find((permission) => permission.moduleCode === module.code);
      return { moduleCode: module.code, canRead: current?.canRead ?? false, canCreate: current?.canCreate ?? false, canUpdate: current?.canUpdate ?? false, canDelete: current?.canDelete ?? false };
    }));
  const save = useMutation({ mutationFn: accessControlService.replacePermissions, onSuccess: async () => { await client.invalidateQueries({ queryKey: accessKeys.all }); toast.success("Permisos del rol actualizados."); } });
  return <div className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-medium">{role.name}</h2><p className="mt-1 text-xs text-muted-foreground">{role.userCount} usuarios · detalle consultado desde la API</p></div>{canUpdate ? <Button className="h-9 gap-2" disabled={save.isPending} onClick={() => save.mutate({ roleId, permissions })}><Save className="h-4 w-4" />{save.isPending ? "Guardando…" : "Guardar"}</Button> : null}</div>
    <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="p-3 font-medium">Módulo</th>{actions.map((action) => <th key={action.key} className="p-3 text-center font-medium">{action.label}</th>)}</tr></thead><tbody>{permissions.map((permission, index) => <tr key={permission.moduleCode} className="border-b border-border last:border-0"><td className="p-3"><span className="font-mono text-xs">{permission.moduleCode}</span><span className="block text-[11px] text-muted-foreground">{modules.find((module) => module.code === permission.moduleCode)?.description ?? "Módulo del sistema"}</span></td>{actions.map((action) => <td key={action.key} className="p-3 text-center"><input type="checkbox" checked={permission[action.key]} disabled={!canUpdate} aria-label={`${action.label} ${permission.moduleCode}`} onChange={(event) => setPermissions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [action.key]: event.target.checked } : item))} className="h-4 w-4 accent-primary" /></td>)}</tr>)}</tbody></table></div>
  </div>;
}

function RolePermissions({ roleId, canUpdate }: { roleId: string; canUpdate: boolean }) {
  const modules = useQuery(accessModulesOptions());
  const role = useQuery(accessRoleOptions(roleId));
  if (role.isLoading || modules.isLoading) return <p className="p-5 text-sm text-muted-foreground">Cargando permisos…</p>;
  if (role.error || modules.error) return <p role="alert" className="p-5 text-sm text-danger">{role.error?.message ?? modules.error?.message}</p>;
  if (!role.data || !modules.data) return null;
  return <RolePermissionsEditor key={`${role.data.id}-${role.data.permissions.length}`} roleId={roleId} canUpdate={canUpdate} modules={modules.data} role={role.data} />;
}

export function AccessControlWorkspace() {
  const client = useQueryClient();
  const { data: user } = useCurrentUser();
  const roles = useQuery(accessRolesOptions());
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const canCreate = user?.permissions.includes("roles.create") ?? false;
  const canUpdate = user?.permissions.includes("roles.update") ?? false;
  const effectiveRoleId = selectedRoleId || roles.data?.[0]?.id || "";
  const create = useMutation({ mutationFn: accessControlService.createRole, onSuccess: async (role) => { await client.invalidateQueries({ queryKey: accessKeys.roles() }); setSelectedRoleId(role.id); toast.success("Rol creado."); } });
  const assign = useMutation({ mutationFn: accessControlService.assignUserRole, onSuccess: (result) => toast.success(`${result.username} ahora tiene el rol ${result.roleName}.`) });

  return <div className="mx-auto max-w-7xl space-y-6"><header className="border-b border-border pb-6"><div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5" />RBAC operativo</div><h1 className="mt-3 text-2xl font-medium tracking-[-0.04em]">Roles y permisos</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Administra módulos, acciones y asignaciones sin salir del contrato protegido de la API.</p></header>
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]"><aside className="rounded-2xl border border-border bg-card p-3"><p className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Roles</p>{roles.error ? <p className="p-2 text-sm text-danger">{roles.error.message}</p> : <div className="space-y-1">{roles.data?.map((role) => <button key={role.id} type="button" onClick={() => setSelectedRoleId(role.id)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm ${effectiveRoleId === role.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}><span>{role.name}</span><span className="text-xs opacity-70">{role.userCount}</span></button>)}</div>}{canCreate ? <form className="mt-3 flex gap-2 border-t border-border pt-3" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const name = String(new FormData(form).get("name") ?? "").trim(); if (name.length >= 2) create.mutate(name, { onSuccess: () => form.reset() }); }}><Input name="name" minLength={2} maxLength={80} placeholder="Nuevo rol" /><Button type="submit" className="w-11 px-0" aria-label="Crear rol" disabled={create.isPending}><Plus className="h-4 w-4" /></Button></form> : null}</aside>
      <section className="overflow-hidden rounded-2xl border border-border bg-card">{effectiveRoleId ? <RolePermissions key={effectiveRoleId} roleId={effectiveRoleId} canUpdate={canUpdate} /> : <p className="p-5 text-sm text-muted-foreground">Selecciona un rol.</p>}</section></div>
    {canUpdate ? <section className="rounded-2xl border border-border bg-card p-5"><h2 className="flex items-center gap-2 text-sm font-medium"><UserCog className="h-4 w-4" />Asignar rol a un usuario</h2><p className="mt-2 text-xs text-muted-foreground">La API audita el cambio y evita eliminar el último administrador activo.</p><form className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(180px,.6fr)_auto]" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); const userId = String(data.get("userId") || ""); const roleId = String(data.get("roleId") || ""); if (!userId || !roleId) return; assign.mutate({ userId, roleId }); }}><UserEntityCombobox name="userId" placeholder="Usuario" /><select name="roleId" required className="h-11 rounded-xl border border-border bg-background px-3 text-sm"><option value="">Selecciona rol</option>{roles.data?.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select><Button type="submit" variant="secondary" className="h-11 gap-2" disabled={assign.isPending}><KeyRound className="h-4 w-4" />Asignar</Button></form>{assign.error ? <p className="mt-3 text-sm text-danger">{assign.error.message}</p> : null}</section> : null}
  </div>;
}
