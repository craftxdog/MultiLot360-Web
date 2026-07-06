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
import { activeDrawShiftsQueryOptions } from "@/features/draws/queries/draw.queries";
import { useNumberControlMutations } from "../hooks/use-number-control-mutations";
import { createBlockedNumbersSchema, type CreateBlockedNumbersValues } from "../schemas/number-control.schema";
import { getTodayInManagua } from "../utils/number-control-formatters";
import { NumberControlSelect } from "./number-control-select";
import { NumberPickerGrid } from "./number-picker-grid";

export function BlockedNumberForm({ onSuccess }: { onSuccess: () => void }) {
  const user = useCurrentUser();
  const canReadShifts = user.data?.permissions.includes("turnos.read") ?? false;
  const shifts = useQuery({ ...activeDrawShiftsQueryOptions({ page: 1, limit: 50, sortBy: "configurationTime", sortDirection: "asc" }), enabled: canReadShifts });
  const { createBlockedNumbers } = useNumberControlMutations();
  const [scope, setScope] = React.useState<"DATE" | "SHIFT">("DATE");
  const form = useForm<CreateBlockedNumbersValues>({ resolver: zodResolver(createBlockedNumbersSchema), defaultValues: { numbers: [], date: getTodayInManagua(), reason: "" } });
  const selectedNumbers = useWatch({ control: form.control, name: "numbers" });

  async function submit(values: CreateBlockedNumbersValues) {
    try {
      await createBlockedNumbers.mutateAsync({ numbers: values.numbers, date: scope === "DATE" ? values.date : undefined, shiftId: scope === "SHIFT" ? values.shiftId : undefined, reason: values.reason || undefined });
      onSuccess();
    } catch {}
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(submit)}>
      <Controller control={form.control} name="numbers" render={({ field }) => <NumberPickerGrid value={field.value} onChange={field.onChange} disabled={createBlockedNumbers.isPending} />} />
      <FieldError message={form.formState.errors.numbers?.message} />
      <section className="rounded-2xl border border-border bg-muted/30 p-4">
        <Label>Aplicar bloqueo a</Label>
        <NumberControlSelect className="mt-2" ariaLabel="Alcance del bloqueo" value={scope} onChange={(value) => { setScope(value); if (value === "DATE") { form.setValue("shiftId", undefined); form.setValue("date", getTodayInManagua()); } else form.setValue("date", undefined); }} options={[{ label: "Todo el día", value: "DATE" }, { label: "Un turno específico", value: "SHIFT" }]} />
        {scope === "DATE" ? <div className="mt-3"><Label htmlFor="blockDate">Fecha operativa</Label><Input id="blockDate" type="date" className="mt-2" {...form.register("date")} /><FieldError message={form.formState.errors.date?.message} /></div> : <div className="mt-3"><Label htmlFor="shiftId">Turno</Label>{canReadShifts ? <Controller control={form.control} name="shiftId" render={({ field }) => <NumberControlSelect className="mt-2" ariaLabel="Turno" value={field.value ?? ""} onChange={field.onChange} options={[{ label: "Selecciona un turno activo", value: "" }, ...(shifts.data?.shifts ?? []).map((shift) => ({ label: `${shift.configuration.code} · ${shift.date} ${shift.configuration.time.slice(0, 5)}`, value: shift.id }))]} />} /> : <Input id="shiftId" className="mt-2" placeholder="UUID del turno" {...form.register("shiftId")} />}<FieldError message={form.formState.errors.shiftId?.message} /></div>}
      </section>
      <div><Label htmlFor="reason">Motivo <span className="font-normal text-muted-foreground">(opcional)</span></Label><textarea id="reason" rows={3} maxLength={250} placeholder="Ej. reservado por decisión operativa" className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-foreground/25 focus:ring-2 focus:ring-foreground/8" {...form.register("reason")} /><FieldError message={form.formState.errors.reason?.message} /></div>
      <Button type="submit" className="w-full" disabled={createBlockedNumbers.isPending}>{createBlockedNumbers.isPending ? "Aplicando bloqueo…" : `Bloquear ${selectedNumbers.length || ""} número${selectedNumbers.length === 1 ? "" : "s"}`}</Button>
    </form>
  );
}
