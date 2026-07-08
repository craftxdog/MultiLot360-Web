"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Braces, Hash, Save, ShieldAlert, Sparkles, Type, X } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useParameterMutations } from "../hooks/use-parameter-mutations";
import { useParameter } from "../hooks/use-parameters";
import {
  upsertSystemParameterSchema,
  type ParameterEditorInput,
  type UpsertSystemParameterPayload,
} from "../schemas/parameter.schema";
import { useParameterWorkspaceStore } from "../store/parameter-workspace.store";
import { ParameterKindBadge } from "./parameter-kind-badge";

const emptyValues: ParameterEditorInput = { key: "", value: "" };

function getJsonState(value: string) {
  const normalized = value.trim();
  const looksLikeJson = normalized.startsWith("{") || normalized.startsWith("[");

  if (!looksLikeJson) return { looksLikeJson: false, valid: true };

  try {
    JSON.parse(normalized);
    return { looksLikeJson: true, valid: true };
  } catch {
    return { looksLikeJson: true, valid: false };
  }
}

export function ParameterEditorDrawer() {
  const open = useParameterWorkspaceStore((state) => state.editorOpen);
  const selected = useParameterWorkspaceStore(
    (state) => state.selectedParameter,
  );
  const draft = useParameterWorkspaceStore((state) => state.draftParameter);
  const close = useParameterWorkspaceStore((state) => state.closeEditor);
  const { upsertParameter } = useParameterMutations();
  const detail = useParameter(selected?.key ?? "");
  const currentParameter = detail.data ?? selected;
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<
    ParameterEditorInput,
    unknown,
    UpsertSystemParameterPayload
  >({
    resolver: zodResolver(upsertSystemParameterSchema),
    defaultValues: emptyValues,
  });
  const value = useWatch({ control, name: "value" }) ?? "";
  const jsonState = getJsonState(value);

  useEffect(() => {
    reset(
      currentParameter
        ? { key: currentParameter.key, value: currentParameter.value }
        : draft
          ? { key: draft.key, value: draft.value }
        : emptyValues,
    );
  }, [currentParameter, draft, open, reset]);

  const closeDrawer = () => {
    if (!upsertParameter.isPending) close();
  };

  const submit = handleSubmit(async (input) => {
    if (!jsonState.valid) return;

    try {
      await upsertParameter.mutateAsync(input);
      close();
    } catch {
      // La mutación muestra el error y conserva el formulario.
    }
  });

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar editor de parámetro"
            className="fixed inset-0 z-40 cursor-default bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="parameter-editor-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-border bg-background shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Configuración central
                </p>
                <h2
                  id="parameter-editor-title"
                  className="mt-1 text-base font-medium text-foreground"
                >
                  {selected ? "Editar parámetro" : "Nuevo parámetro"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                disabled={upsertParameter.isPending}
                aria-label="Cerrar"
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                <div className="flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/7 p-4">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
                  <p className="text-xs leading-5 text-muted-foreground">
                    Estos valores cambian el comportamiento del sistema en vivo.
                    Revisa la explicación, usa los botones rápidos y guarda solo
                    cuando estés seguro del efecto operativo.
                  </p>
                </div>

                {detail.error ? (
                  <div role="alert" className="rounded-xl border border-danger/25 bg-danger/10 p-3 text-xs text-danger">
                    {detail.error.message}
                  </div>
                ) : null}

                <div>
                  <Label htmlFor="parameterKey">Qué regla quieres configurar</Label>
                  <Input
                    id="parameterKey"
                    className="mt-2 font-mono read-only:cursor-not-allowed read-only:bg-muted/50 read-only:text-muted-foreground"
                    placeholder="sales.void_window_minutes"
                    autoCapitalize="none"
                    spellCheck={false}
                    readOnly={Boolean(selected)}
                    aria-readonly={Boolean(selected)}
                    aria-invalid={Boolean(errors.key)}
                    {...register("key")}
                  />
                  <FieldError message={errors.key?.message} />
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Usa una clave descriptiva por módulo. Ejemplo: sales.void_window_minutes.
                    Una clave existente no se renombra; se edita su valor.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-muted/35 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Valor guiado</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        El valor se guarda como texto en la API, pero aquí puedes definirlo de forma legible.
                      </p>
                    </div>
                    <ParameterKindBadge value={value} />
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl border border-border bg-card p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/8 text-primary">
                            <Sparkles className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-xs font-medium text-foreground">Activar o desactivar</p>
                            <p className="mt-1 text-[11px] text-muted-foreground">Útil para reglas como notificaciones, decimales o autogeneración.</p>
                          </div>
                        </div>
                        <Switch
                          ariaLabel="Activar valor booleano"
                          checked={value.trim() === "true"}
                          onCheckedChange={(checked) => setValue("value", checked ? "true" : "false", { shouldDirty: true, shouldValidate: true })}
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-3">
                      <div className="flex items-start gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-muted-foreground">
                          <Hash className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground">Número rápido</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {["0", "1", "5", "10", "30", "100"].map((option) => (
                              <button key={option} type="button" onClick={() => setValue("value", option, { shouldDirty: true, shouldValidate: true })} className="h-8 rounded-lg border border-border px-3 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground">
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-3">
                      <div className="flex items-start gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-muted-foreground">
                          <Type className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <Label htmlFor="parameterValue">Valor personalizado</Label>
                          <Textarea
                            id="parameterValue"
                            rows={5}
                            maxLength={2000}
                            className="mt-2 text-sm leading-6"
                            placeholder="Ej. 10, true, Mensaje de pie de ticket"
                            spellCheck={false}
                            aria-invalid={Boolean(errors.value) || !jsonState.valid}
                            {...register("value")}
                          />
                          <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                            <span>{value.length}/2000 caracteres</span>
                            {jsonState.looksLikeJson ? (
                              <span className={jsonState.valid ? "text-emerald-700 dark:text-emerald-300" : "text-danger"}>
                                <Braces className="mr-1 inline h-3.5 w-3.5" />
                                {jsonState.valid ? "Configuración avanzada válida" : "Configuración avanzada incompleta"}
                              </span>
                            ) : null}
                          </div>
                          <FieldError message={errors.value?.message} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-4 sm:px-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeDrawer}
                  disabled={upsertParameter.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="gap-2"
                  disabled={upsertParameter.isPending || !jsonState.valid}
                >
                  <Save className="h-4 w-4" />
                  {upsertParameter.isPending
                    ? "Guardando..."
                    : selected
                      ? "Guardar cambios"
                      : "Crear parámetro"}
                </Button>
              </footer>
            </form>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
