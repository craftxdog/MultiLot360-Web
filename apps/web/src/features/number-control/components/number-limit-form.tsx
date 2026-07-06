"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { drawConfigurationsQueryOptions } from "@/features/draws/queries/draw.queries";
import { sellerDirectoryQueryOptions } from "@/features/sellers/queries/seller.queries";
import { useNumberControlMutations } from "../hooks/use-number-control-mutations";
import { createNumberLimitsSchema, type CreateNumberLimitsValues } from "../schemas/number-control.schema";
import type { NumberLimit } from "../types/number-control.types";
import { getTodayInManagua } from "../utils/number-control-formatters";
import { NumberControlSelect } from "./number-control-select";
import { NumberPickerGrid } from "./number-picker-grid";

type ScopeMode = "GLOBAL" | "SELLER";
type DrawMode = "DEFAULT" | "DRAW";

export function NumberLimitForm({ limit, onSuccess }: { limit?: NumberLimit | null; onSuccess: () => void }) {
  const currentUser = useCurrentUser();
  const permissions = currentUser.data?.permissions ?? [];
  const canReadSellers = permissions.includes("vendedores.read");
  const canReadConfigurations = permissions.includes("sorteos.read");
  const sellers = useQuery({ ...sellerDirectoryQueryOptions({ page: 1, limit: 100, active: true, sortBy: "name", sortDirection: "asc" }), enabled: canReadSellers });
  const configurations = useQuery({ ...drawConfigurationsQueryOptions({ page: 1, limit: 100, active: true, sortBy: "time", sortDirection: "asc" }), enabled: canReadConfigurations });
  const { createLimits, updateLimit } = useNumberControlMutations();
  const [sellerMode, setSellerMode] = React.useState<ScopeMode>(limit?.seller ? "SELLER" : "GLOBAL");
  const [drawMode, setDrawMode] = React.useState<DrawMode>(limit?.drawConfiguration ? "DRAW" : "DEFAULT");
  const form = useForm<CreateNumberLimitsValues>({
    resolver: zodResolver(createNumberLimitsSchema),
    defaultValues: {
      sellerId: limit?.seller?.id,
      drawConfigurationId: limit?.drawConfiguration?.id,
      numbers: limit ? [limit.number] : [],
      limitMiles: limit?.limitMiles ?? 100,
      validFrom: limit?.validFrom ?? getTodayInManagua(),
      validUntil: limit?.validUntil ?? undefined,
    },
  });
  const selectedNumbers = useWatch({ control: form.control, name: "numbers" });

  const pending = createLimits.isPending || updateLimit.isPending;
  async function submit(values: CreateNumberLimitsValues) {
    try {
      if (limit) {
        await updateLimit.mutateAsync({ limitId: limit.id, input: {
          sellerId: sellerMode === "SELLER" ? values.sellerId : null,
          drawConfigurationId: drawMode === "DRAW" ? values.drawConfigurationId : null,
          number: values.numbers[0], limitMiles: values.limitMiles, validFrom: values.validFrom, validUntil: values.validUntil || null,
        } });
      } else {
        await createLimits.mutateAsync({
          sellerId: sellerMode === "SELLER" ? values.sellerId : undefined,
          drawConfigurationId: drawMode === "DRAW" ? values.drawConfigurationId : undefined,
          numbers: values.numbers, limitMiles: values.limitMiles, validFrom: values.validFrom, validUntil: values.validUntil || undefined,
        });
      }
      onSuccess();
    } catch {}
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(submit)}>
      <Controller control={form.control} name="numbers" render={({ field }) => <NumberPickerGrid value={field.value} onChange={field.onChange} disabled={pending} max={limit ? 1 : 100} />} />
      <FieldError message={form.formState.errors.numbers?.message} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label htmlFor="limitMiles">Límite en miles</Label><Input id="limitMiles" type="number" min={1} max={999999} className="mt-2 font-mono" disabled={pending} {...form.register("limitMiles", { valueAsNumber: true })} /><FieldError message={form.formState.errors.limitMiles?.message} /></div>
        <div><Label htmlFor="validFrom">Vigente desde</Label><Input id="validFrom" type="date" className="mt-2" disabled={pending} {...form.register("validFrom")} /><FieldError message={form.formState.errors.validFrom?.message} /></div>
        <div className="sm:col-span-2"><Label htmlFor="validUntil">Vigente hasta <span className="font-normal text-muted-foreground">(opcional)</span></Label><Input id="validUntil" type="date" className="mt-2" disabled={pending} {...form.register("validUntil", { setValueAs: (value) => value || undefined })} /><FieldError message={form.formState.errors.validUntil?.message} /></div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-border bg-muted/30 p-4"><p className="text-sm font-medium text-foreground">Alcance por vendedor</p><NumberControlSelect className="mt-3" ariaLabel="Alcance por vendedor" value={sellerMode} onChange={(value) => { setSellerMode(value); if (value === "GLOBAL") form.setValue("sellerId", undefined); }} options={[{ label: "Todos los vendedores", value: "GLOBAL" }, { label: "Un vendedor", value: "SELLER" }]} />
          {sellerMode === "SELLER" ? canReadSellers ? <Controller control={form.control} name="sellerId" render={({ field }) => <NumberControlSelect className="mt-2" ariaLabel="Vendedor" value={field.value ?? ""} onChange={field.onChange} options={[{ label: "Selecciona un vendedor", value: "" }, ...(sellers.data?.sellers ?? []).map((seller) => ({ label: seller.name, value: seller.id }))]} />} /> : <p className="mt-3 rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">Necesitas permiso para listar vendedores antes de crear un límite por vendedor.</p> : null}
          <FieldError message={form.formState.errors.sellerId?.message} />
        </section>
        <section className="rounded-2xl border border-border bg-muted/30 p-4"><p className="text-sm font-medium text-foreground">Alcance por sorteo</p><NumberControlSelect className="mt-3" ariaLabel="Alcance por sorteo" value={drawMode} onChange={(value) => { setDrawMode(value); if (value === "DEFAULT") form.setValue("drawConfigurationId", undefined); }} options={[{ label: "Todos los sorteos", value: "DEFAULT" }, { label: "Un sorteo", value: "DRAW" }]} />
          {drawMode === "DRAW" ? canReadConfigurations ? <Controller control={form.control} name="drawConfigurationId" render={({ field }) => <NumberControlSelect className="mt-2" ariaLabel="Sorteo" value={field.value ?? ""} onChange={field.onChange} options={[{ label: "Selecciona un sorteo", value: "" }, ...(configurations.data?.configurations ?? []).map((item) => ({ label: `${item.code} · ${item.time.slice(0, 5)}`, value: item.id }))]} />} /> : <p className="mt-3 rounded-xl border border-border bg-background p-3 text-xs text-muted-foreground">Necesitas permiso para listar sorteos antes de limitar un sorteo específico.</p> : null}
          <FieldError message={form.formState.errors.drawConfigurationId?.message} />
        </section>
      </div>
      <Button className="w-full" type="submit" disabled={pending}>{pending ? "Guardando…" : limit ? "Guardar cambios" : `Crear ${selectedNumbers.length || ""} límite${selectedNumbers.length === 1 ? "" : "s"}`}</Button>
    </form>
  );
}
