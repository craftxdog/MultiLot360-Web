"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Label } from "@/components/ui/label";

import { DrawsDateField } from "../draws-date-field";
import { DrawsSelect } from "../draws-select";
import { useDrawConfigurations } from "../../hooks/use-draw-configurations";
import { useDrawShiftMutations } from "../../hooks/use-draw-shift-mutations";
import {
  createDrawShiftSchema,
  type CreateDrawShiftFormValues,
} from "../../schemas/draws.schema";
import { formatDrawTime } from "../../utils/draws-formatters";

type DrawShiftFormProps = {
  onSuccess?: () => void;
};

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function DrawShiftForm({ onSuccess }: DrawShiftFormProps) {
  const configurationsQuery = useDrawConfigurations({
    page: 1,
    limit: 100,
    active: true,
    sortBy: "time",
    sortDirection: "asc",
  });

  const { createShift } = useDrawShiftMutations();

  const form = useForm<CreateDrawShiftFormValues>({
    resolver: zodResolver(createDrawShiftSchema),
    defaultValues: {
      configurationId: "",
      date: getTodayDate(),
    },
  });

  const configurationOptions = [
    {
      label: "Selecciona una configuración",
      value: "",
    },
    ...(configurationsQuery.data?.configurations ?? []).map((configuration) => ({
      label: `${configuration.code} · ${formatDrawTime(configuration.time)}`,
      value: configuration.id,
    })),
  ];

  async function onSubmit(values: CreateDrawShiftFormValues) {
    try {
      await createShift.mutateAsync(values);
      form.reset({
        configurationId: "",
        date: getTodayDate(),
      });
      onSuccess?.();
    } catch {
      // El hook mantiene el drawer abierto y muestra el error normalizado.
    }
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <Label>Configuración</Label>

        <Controller
          control={form.control}
          name="configurationId"
          render={({ field }) => (
            <DrawsSelect
              ariaLabel="Configuración del sorteo"
              value={field.value}
              onChange={field.onChange}
              className="mt-2"
              options={configurationOptions}
            />
          )}
        />

        <FieldError message={form.formState.errors.configurationId?.message} />
      </div>

      <div>
        <Label>Fecha</Label>

        <Controller
          control={form.control}
          name="date"
          render={({ field }) => (
            <DrawsDateField
              value={field.value}
              onChange={field.onChange}
              className="mt-2"
            />
          )}
        />

        <FieldError message={form.formState.errors.date?.message} />
      </div>

      <Button
        className="w-full"
        disabled={createShift.isPending || configurationsQuery.isLoading}
        type="submit"
      >
        Crear turno
      </Button>
    </form>
  );
}
