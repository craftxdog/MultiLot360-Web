"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DrawsSwitch } from "../draws-switch";
import { useDrawConfigurationMutations } from "../../hooks/use-draw-configuration-mutations";
import {
  drawConfigurationSchema,
  type DrawConfigurationFormValues,
} from "../../schemas/draws.schema";
import type { DrawConfiguration } from "../../types/draws.types";

type DrawConfigurationFormProps = {
  configuration?: DrawConfiguration | null;
  onSuccess?: () => void;
};

export function DrawConfigurationForm({
  configuration,
  onSuccess,
}: DrawConfigurationFormProps) {
  const { createConfiguration, updateConfiguration } =
    useDrawConfigurationMutations();

  const form = useForm<DrawConfigurationFormValues>({
    resolver: zodResolver(drawConfigurationSchema),
    defaultValues: {
      code: configuration?.code ?? "",
      time: configuration?.time ?? "11:00:00",
      tuesdayOnly: configuration?.tuesdayOnly ?? false,
      lockSecondsBefore: configuration?.lockSecondsBefore ?? 60,
      reopenSecondsAfter: configuration?.reopenSecondsAfter ?? 600,
      active: configuration?.active ?? true,
    },
  });

  React.useEffect(() => {
    form.reset({
      code: configuration?.code ?? "",
      time: configuration?.time ?? "11:00:00",
      tuesdayOnly: configuration?.tuesdayOnly ?? false,
      lockSecondsBefore: configuration?.lockSecondsBefore ?? 60,
      reopenSecondsAfter: configuration?.reopenSecondsAfter ?? 600,
      active: configuration?.active ?? true,
    });
  }, [configuration, form]);

  const isPending =
    createConfiguration.isPending || updateConfiguration.isPending;

  async function onSubmit(values: DrawConfigurationFormValues) {
    try {
      if (configuration) {
        await updateConfiguration.mutateAsync({
          configurationId: configuration.id,
          input: values,
        });
      } else {
        await createConfiguration.mutateAsync(values);
      }

      onSuccess?.();
    } catch {
      // El hook muestra el error normalizado sin cerrar el formulario.
    }
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="code">Código</Label>
        <Input
          id="code"
          placeholder="nacional-11am"
          disabled={isPending}
          className="mt-2"
          {...form.register("code")}
        />
        <FieldError message={form.formState.errors.code?.message} />
      </div>

      <div>
        <Label htmlFor="time">Hora</Label>
        <Input
          id="time"
          type="time"
          step={1}
          disabled={isPending}
          className="mt-2"
          {...form.register("time")}
        />
        <FieldError message={form.formState.errors.time?.message} />
      </div>

      <div>
        <Label htmlFor="lockSecondsBefore">
          Segundos antes de bloquear
        </Label>
        <Input
          id="lockSecondsBefore"
          type="number"
          min={0}
          max={3600}
          disabled={isPending}
          className="mt-2"
          {...form.register("lockSecondsBefore", {
            valueAsNumber: true,
          })}
        />
        <FieldError
          message={form.formState.errors.lockSecondsBefore?.message}
        />
      </div>

      <div>
        <Label htmlFor="reopenSecondsAfter">
          Segundos después para reabrir
        </Label>
        <Input
          id="reopenSecondsAfter"
          type="number"
          min={0}
          max={86400}
          disabled={isPending}
          className="mt-2"
          {...form.register("reopenSecondsAfter", {
            valueAsNumber: true,
          })}
        />
        <FieldError
          message={form.formState.errors.reopenSecondsAfter?.message}
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/45 p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Solo martes</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Esta configuración solamente se usará los martes.
          </p>
        </div>

        <Controller
          control={form.control}
          name="tuesdayOnly"
          render={({ field }) => (
            <DrawsSwitch
              checked={field.value}
              disabled={isPending}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/45 p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Activa</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Permite crear turnos desde esta configuración.
          </p>
        </div>

        <Controller
          control={form.control}
          name="active"
          render={({ field }) => (
            <DrawsSwitch
              checked={field.value}
              disabled={isPending}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <Button className="w-full" disabled={isPending} type="submit">
        {configuration ? "Guardar cambios" : "Crear configuración"}
      </Button>
    </form>
  );
}
