"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NumberControlTab, NumberControlWorkspaceQuery } from "../types/number-control.types";
import { normalizeLotteryNumber } from "../utils/number-control-query";
import { NumberControlSelect } from "./number-control-select";

export function NumberControlToolbar({ tab, query, onChange }: { tab: NumberControlTab; query: NumberControlWorkspaceQuery; onChange: (changes: Partial<NumberControlWorkspaceQuery>) => void }) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const hasFilters = Boolean(query.number || query.date || query.drawCode || query.active !== undefined || query.sellerScope || query.drawScope || query.scope);

  return (
    <form ref={formRef} className="grid gap-2 lg:grid-cols-[minmax(180px,1fr)_repeat(3,minmax(140px,auto))_auto]" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onChange({ number: normalizeLotteryNumber(String(data.get("number") ?? "")) || undefined, drawCode: String(data.get("drawCode") ?? "").trim().toLowerCase() || undefined }); }}>
      <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input key={query.number} name="number" aria-label="Buscar número" inputMode="numeric" maxLength={2} defaultValue={query.number ?? ""} onInput={(event) => { event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "").slice(0, 2); }} placeholder="Número 00–99" className="pl-10 font-mono" /></div>
      {tab === "limits" ? <>
        <NumberControlSelect ariaLabel="Estado de vigencia" value={query.active === undefined ? "ALL" : query.active ? "true" : "false"} onChange={(value) => onChange({ active: value === "ALL" ? undefined : value === "true" })} options={[{ label: "Toda vigencia", value: "ALL" }, { label: "Vigentes", value: "true" }, { label: "No vigentes", value: "false" }]} />
        <NumberControlSelect ariaLabel="Alcance por vendedor" value={query.sellerScope ?? "ALL"} onChange={(value) => onChange({ sellerScope: value === "ALL" ? undefined : value })} options={[{ label: "Todos los vendedores", value: "ALL" }, { label: "Global", value: "GLOBAL" }, { label: "Personalizado", value: "SELLER" }]} />
        <NumberControlSelect ariaLabel="Alcance por sorteo" value={query.drawScope ?? "ALL"} onChange={(value) => onChange({ drawScope: value === "ALL" ? undefined : value })} options={[{ label: "Todos los sorteos", value: "ALL" }, { label: "Predeterminado", value: "DEFAULT" }, { label: "Por sorteo", value: "DRAW" }]} />
      </> : <>
        <NumberControlSelect ariaLabel="Alcance del bloqueo" value={query.scope ?? "ALL"} onChange={(value) => onChange({ scope: value === "ALL" ? undefined : value })} options={[{ label: "Todos los alcances", value: "ALL" }, { label: "Día completo", value: "DATE" }, { label: "Por turno", value: "SHIFT" }]} />
        <Input aria-label="Fecha del bloqueo" type="date" value={query.date ?? ""} onChange={(event) => onChange({ date: event.target.value || undefined })} />
        <Input key={query.drawCode} name="drawCode" aria-label="Código de sorteo" defaultValue={query.drawCode ?? ""} placeholder="Código de sorteo" />
      </>}
      <div className="flex gap-2"><Button type="submit" variant="secondary" className="w-11 px-0" aria-label="Aplicar búsqueda"><SlidersHorizontal className="h-4 w-4" /></Button>{hasFilters ? <Button type="button" variant="ghost" className="w-11 px-0" aria-label="Limpiar filtros" onClick={() => { formRef.current?.reset(); onChange({ number: undefined, active: undefined, sellerScope: undefined, drawScope: undefined, scope: undefined, date: undefined, drawCode: undefined }); }}><X className="h-4 w-4" /></Button> : null}</div>
    </form>
  );
}
