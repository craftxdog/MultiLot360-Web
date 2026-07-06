"use client";

import * as React from "react";
import { Clock3, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSalesMutations } from "../hooks/use-sales-mutations";
import { useSalesVoidPolicy } from "../hooks/use-sales";
import { salesVoidPolicySchema } from "../schemas/sales.schema";
import { useSalesWorkspaceStore } from "../store/sales-workspace.store";
import { SalesDrawer } from "./sales-drawer";

export function SalesPolicyDrawer() {
  const open = useSalesWorkspaceStore((state) => state.policyDrawerOpen);
  const close = useSalesWorkspaceStore((state) => state.closePolicy);
  const policy = useSalesVoidPolicy(open);
  const { updateVoidPolicy } = useSalesMutations();
  const [minutes, setMinutes] = React.useState<number | "">("");
  const effective = minutes === "" ? policy.data?.windowMinutes ?? "" : minutes;
  const parsed = salesVoidPolicySchema.safeParse({ windowMinutes: effective });
  return <SalesDrawer open={open} onClose={close} title="Política de anulación" description="Define cuánto tiempo existe para revertir un ticket después de registrarlo."><div className="rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4"><div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 text-amber-700 dark:text-amber-300" /><p className="text-sm leading-6 text-muted-foreground">La ventana nunca evita las demás reglas: el turno también debe permanecer abierto y cada vendedor solo puede anular sus propias ventas.</p></div></div><div className="mt-6"><Label htmlFor="voidMinutes">Ventana en minutos</Label><div className="relative mt-2"><Clock3 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="voidMinutes" type="number" min={1} max={1440} value={effective} onChange={(event) => setMinutes(event.target.value ? Number(event.target.value) : "")} className="pl-10 font-mono text-lg" /></div><p className="mt-2 text-xs text-muted-foreground">Entre 1 minuto y 24 horas (1,440 minutos).</p></div><Button className="mt-6 w-full" disabled={!parsed.success || updateVoidPolicy.isPending} onClick={async () => { if (!parsed.success) return; try { await updateVoidPolicy.mutateAsync(parsed.data.windowMinutes); close(); setMinutes(""); } catch {} }}>{updateVoidPolicy.isPending ? "Guardando…" : "Guardar política"}</Button></SalesDrawer>;
}
