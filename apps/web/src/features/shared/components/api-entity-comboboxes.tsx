"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { EntityCombobox, type EntityComboboxOption } from "@/components/ui/entity-combobox";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { drawShiftsQueryOptions } from "@/features/draws/queries/draw.queries";
import type { DrawShiftStatus } from "@/features/draws/types/draws.types";
import { useSellerDirectory } from "@/features/sellers/hooks/use-sellers";

function uniqByValue(options: EntityComboboxOption[]) {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (!option.value || seen.has(option.value)) return false;
    seen.add(option.value);
    return true;
  });
}

function useCan(permission: string) {
  const user = useCurrentUser();
  return {
    user,
    can: user.data?.permissions.includes(permission) ?? false,
  };
}

function useSellerEntityOptions() {
  const { user, can } = useCan("vendedores.read");
  const directory = useSellerDirectory(
    { active: true, page: 1, limit: 100, sortBy: "name", sortDirection: "asc" },
    can,
  );
  const current = user.data?.seller
    ? [{
        value: user.data.seller.id,
        label: user.data.seller.name ?? user.data.username ?? "Mi vendedor",
        description: "Mi vendedor",
      }]
    : [];
  const directoryOptions = (directory.data?.sellers ?? []).map((seller) => ({
    value: seller.id,
    label: seller.name,
    description: `${seller.username} · ${seller.documentId}`,
  }));

  return {
    options: uniqByValue([...current, ...directoryOptions]),
    canReadDirectory: can,
    isLoading: directory.isLoading,
  };
}

function useUserEntityOptions() {
  const { user, can } = useCan("vendedores.read");
  const directory = useSellerDirectory(
    { active: true, page: 1, limit: 100, sortBy: "name", sortDirection: "asc" },
    can,
  );
  const current = user.data
    ? [{
        value: user.data.id,
        label: user.data.name ?? user.data.username ?? "Usuario actual",
        description: `${user.data.username} · ${user.data.role.name}`,
      }]
    : [];
  const sellerUsers = (directory.data?.sellers ?? []).map((seller) => ({
    value: seller.userId,
    label: seller.userName ?? seller.name,
    description: `${seller.username} · ${seller.roleName}`,
  }));

  return {
    options: uniqByValue([...current, ...sellerUsers]),
    canReadDirectory: can,
    isLoading: directory.isLoading,
  };
}

function formatShiftDescription(status: string, time: string) {
  return `${status} · ${time.slice(0, 5)}`;
}

function useShiftEntityOptions(status?: DrawShiftStatus) {
  const { can } = useCan("turnos.read");
  const query = {
    page: 1,
    limit: 100,
    sortBy: "date",
    sortDirection: "desc",
    ...(status ? { status } : {}),
  } as const;
  const shifts = useQuery({ ...drawShiftsQueryOptions(query), enabled: can });
  const options = (can ? shifts.data?.shifts ?? [] : []).map((shift) => ({
    value: shift.id,
    label: `${shift.configuration.code} · ${shift.date}`,
    description: formatShiftDescription(shift.status, shift.configuration.time),
  }));

  return {
    options,
    canReadShifts: can,
    isLoading: shifts.isLoading,
  };
}

export function SellerEntityCombobox({ name, value, placeholder = "Buscar vendedor", className }: { name: string; value?: string; placeholder?: string; className?: string }) {
  const sellers = useSellerEntityOptions();
  return <EntityCombobox name={name} value={value} options={sellers.options} placeholder={placeholder} ariaLabel={placeholder} className={className} disabled={!sellers.canReadDirectory && sellers.options.length === 0} emptyLabel={sellers.isLoading ? "Cargando vendedores…" : "Sin permiso para listar vendedores"} />;
}

export function UserEntityCombobox({ name, value, placeholder = "Buscar usuario", className }: { name: string; value?: string; placeholder?: string; className?: string }) {
  const users = useUserEntityOptions();
  return <EntityCombobox name={name} value={value} options={users.options} placeholder={placeholder} ariaLabel={placeholder} className={className} disabled={!users.canReadDirectory && users.options.length === 0} emptyLabel={users.isLoading ? "Cargando usuarios…" : "Sin directorio de usuarios disponible"} />;
}

export function ShiftEntityCombobox({ name, value, status, placeholder = "Buscar turno", className }: { name: string; value?: string; status?: DrawShiftStatus; placeholder?: string; className?: string }) {
  const shifts = useShiftEntityOptions(status);
  return <EntityCombobox name={name} value={value} options={shifts.options} placeholder={placeholder} ariaLabel={placeholder} className={className} disabled={!shifts.canReadShifts || shifts.options.length === 0} emptyLabel={shifts.isLoading ? "Cargando turnos…" : "Sin turnos disponibles"} />;
}
