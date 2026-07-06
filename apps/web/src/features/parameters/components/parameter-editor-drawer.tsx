"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Braces, Save, ShieldAlert, X } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useParameterMutations } from "../hooks/use-parameter-mutations";
import {
  upsertSystemParameterSchema,
  type ParameterEditorInput,
  type UpsertSystemParameterPayload,
} from "../schemas/parameter.schema";
import { useParameterWorkspaceStore } from "../store/parameter-workspace.store";
import { getParameterValueKind } from "../utils/parameter-formatters";
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
  const close = useParameterWorkspaceStore((state) => state.closeEditor);
  const { upsertParameter } = useParameterMutations();
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
  const kind = getParameterValueKind(value);

  useEffect(() => {
    reset(
      selected
        ? { key: selected.key, value: selected.value }
        : emptyValues,
    );
  }, [open, reset, selected]);

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
                <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/7 p-4">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
                  <p className="text-xs leading-5 text-muted-foreground">
                    Las claves son contratos técnicos consumidos por otros módulos.
                    Una clave existente no se puede renombrar desde esta vista.
                  </p>
                </div>

                <div>
                  <Label htmlFor="parameterKey">Clave técnica</Label>
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
                    Letras, números, punto, guion, dos puntos o guion bajo.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="parameterValue">Valor</Label>
                    <ParameterKindBadge value={value} />
                  </div>
                  <Textarea
                    id="parameterValue"
                    rows={8}
                    maxLength={2000}
                    className="mt-2 font-mono text-xs leading-5"
                    placeholder="10"
                    spellCheck={false}
                    aria-invalid={Boolean(errors.value) || !jsonState.valid}
                    {...register("value")}
                  />
                  <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                    <span>{value.length}/2000 caracteres</span>
                    {jsonState.looksLikeJson ? (
                      <span className={jsonState.valid ? "text-emerald-700 dark:text-emerald-300" : "text-danger"}>
                        <Braces className="mr-1 inline h-3.5 w-3.5" />
                        {jsonState.valid ? "JSON válido" : "JSON incompleto"}
                      </span>
                    ) : null}
                  </div>
                  <FieldError message={errors.value?.message} />
                </div>

                {kind === "boolean" || value === "" ? (
                  <div>
                    <p className="text-xs font-medium text-foreground">Valor rápido</p>
                    <div className="mt-2 flex gap-2">
                      {["true", "false"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setValue("value", option, { shouldDirty: true })}
                          className={`h-9 rounded-lg border px-3 font-mono text-xs transition ${value === option ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
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
