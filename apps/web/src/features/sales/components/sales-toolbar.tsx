"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SalesWorkspaceQuery } from "../types/sales.types";
import { normalizeSaleNumber } from "../utils/sales-query";
import { SalesSelect } from "./sales-select";

export function SalesToolbar({ query, onChange }: { query: SalesWorkspaceQuery; onChange: (changes: Partial<SalesWorkspaceQuery>) => void }) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const hasFilters = Boolean(query.number || query.date || query.drawCode || query.status);
  return <form ref={formRef} className="grid gap-2 lg:grid-cols-[minmax(150px,1fr)_repeat(3,minmax(140px,auto))_auto]" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onChange({ number: normalizeSaleNumber(String(data.get("number") ?? "")) || undefined, drawCode: String(data.get("drawCode") ?? "").trim().toLowerCase() || undefined }); }}><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input key={query.number} name="number" inputMode="numeric" maxLength={2} defaultValue={query.number ?? ""} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 2); }} placeholder="Número 00–99" aria-label="Buscar número" className="pl-10 font-mono" /></div><SalesSelect ariaLabel="Estado de venta" value={query.status ?? "ALL"} onChange={(value) => onChange({ status: value === "ALL" ? undefined : value })} options={[{ value: "ALL", label: "Todos los estados" }, { value: "ACTIVA", label: "Activas" }, { value: "ANULADA", label: "Anuladas" }]} /><Input type="date" aria-label="Fecha de venta" value={query.date ?? ""} onChange={(event) => onChange({ date: event.target.value || undefined })} /><Input key={query.drawCode} name="drawCode" defaultValue={query.drawCode ?? ""} placeholder="Código de sorteo" aria-label="Código de sorteo" /><div className="flex gap-2"><Button type="submit" variant="secondary" className="w-11 px-0" aria-label="Aplicar filtros"><SlidersHorizontal className="h-4 w-4" /></Button>{hasFilters ? <Button type="button" variant="ghost" className="w-11 px-0" aria-label="Limpiar filtros" onClick={() => { formRef.current?.reset(); onChange({ number: undefined, date: undefined, drawCode: undefined, status: undefined }); }}><X className="h-4 w-4" /></Button> : null}</div></form>;
}
