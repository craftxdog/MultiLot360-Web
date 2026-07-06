"use client";

import * as React from "react";
import { Check, Layers3, Plus, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSalesWorkspaceStore } from "../store/sales-workspace.store";
import { consumeSaleDigitPairs, fitSaleNumbersToTicket, sanitizeSaleDigits } from "../utils/sale-number-input";

const QUICK_AMOUNTS = [1, 5, 10, 20, 50, 100];

function OptionCheck({ checked }: { checked: boolean }) {
  return <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-transparent"}`} aria-hidden="true"><Check className="h-3.5 w-3.5" /></span>;
}

export function FastSaleEntry({ disabled }: { disabled?: boolean }) {
  const items = useSalesWorkspaceStore((state) => state.items);
  const addItem = useSalesWorkspaceStore((state) => state.addItem);
  const addItems = useSalesWorkspaceStore((state) => state.addItems);
  const updateItem = useSalesWorkspaceStore((state) => state.updateItem);
  const removeItem = useSalesWorkspaceStore((state) => state.removeItem);
  const [multiple, setMultiple] = React.useState(false);
  const [fixedAmount, setFixedAmount] = React.useState(true);
  const [number, setNumber] = React.useState("");
  const [amount, setAmount] = React.useState("10");
  const [capacityReached, setCapacityReached] = React.useState(false);
  const [amountFocusNumber, setAmountFocusNumber] = React.useState<string | null>(null);
  const numberRef = React.useRef<HTMLInputElement>(null);
  const amountRefs = React.useRef(new Map<string, HTMLInputElement>());
  const parsedAmount = Number(amount);
  const validAmount = Number.isFinite(parsedAmount) && parsedAmount >= 0.01 && parsedAmount <= 999_999 && Number.isInteger(parsedAmount * 100);
  const ticketFull = items.length >= 100;
  const canAddSingle = !disabled && !ticketFull && validAmount && /^\d{2}$/.test(number);

  React.useEffect(() => {
    if (!amountFocusNumber) return;
    const frame = requestAnimationFrame(() => {
      const input = amountRefs.current.get(amountFocusNumber);
      if (!input) return;
      input.focus();
      input.select();
      setAmountFocusNumber(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [amountFocusNumber, items]);

  function focusNumber() {
    requestAnimationFrame(() => numberRef.current?.focus());
  }

  function addSingle() {
    if (!canAddSingle) return;
    addItem({ number, prizeMiles: parsedAmount });
    setNumber("");
    focusNumber();
  }

  function handleNumberChange(value: string) {
    const digits = sanitizeSaleDigits(value);

    if (!multiple) {
      setNumber(digits.slice(0, 2));
      return;
    }

    const consumed = consumeSaleDigitPairs(digits);
    if (consumed.numbers.length && (!fixedAmount || validAmount) && !disabled) {
      const fitted = fitSaleNumbersToTicket(items.map((item) => item.number), consumed.numbers);
      if (fitted.accepted.length) {
        addItems(fitted.accepted.map((fixedNumber) => ({
          number: fixedNumber,
          prizeMiles: fixedAmount ? parsedAmount : null,
        })));
        if (!fixedAmount) setAmountFocusNumber(fitted.accepted[0] ?? null);
      }
      setCapacityReached(fitted.overflow.length > 0);
    }
    setNumber(consumed.remainder);
  }

  function focusNextPendingAmount(currentNumber: string) {
    const nextPending = items.find((item) => item.number !== currentNumber && item.prizeMiles === null);
    if (nextPending) {
      const input = amountRefs.current.get(nextPending.number);
      input?.focus();
      input?.select();
      return;
    }
    focusNumber();
  }

  return <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_16px_45px_rgba(0,0,0,0.045)] sm:p-5" aria-labelledby="quick-entry-title">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 id="quick-entry-title" className="flex items-center gap-2 text-sm font-semibold text-foreground"><Zap className="h-4 w-4 text-amber-500" />Captura rápida</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Teclado numérico, monto y ticket. Sin separadores.</p>
      </div>
      <div className={`grid gap-2 ${multiple ? "grid-cols-1 min-[420px]:grid-cols-2" : "grid-cols-1"}`}>
        <label className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition ${multiple ? "border-primary/35 bg-primary/8" : "border-border bg-muted/35 hover:bg-muted"}`}>
          <input type="checkbox" className="sr-only" checked={multiple} disabled={disabled} onChange={(event) => { setMultiple(event.target.checked); setNumber(""); setCapacityReached(false); focusNumber(); }} />
          <OptionCheck checked={multiple} />
          <span><span className="block text-xs font-medium text-foreground">Varios números</span><span className="block text-[10px] text-muted-foreground">Fijar cada 2 dígitos</span></span>
        </label>
        {multiple ? <label className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 transition ${fixedAmount ? "border-emerald-500/30 bg-emerald-500/8" : "border-border bg-muted/35 hover:bg-muted"}`}>
          <input type="checkbox" className="sr-only" checked={fixedAmount} disabled={disabled} onChange={(event) => { setFixedAmount(event.target.checked); focusNumber(); }} />
          <OptionCheck checked={fixedAmount} />
          <span><span className="block text-xs font-medium text-foreground">Monto fijo</span><span className="block text-[10px] text-muted-foreground">{fixedAmount ? "Aplicar a cada número" : "Completar en la lista"}</span></span>
        </label> : null}
      </div>
    </div>

    <form className="mt-4 grid items-start gap-3 md:grid-cols-[minmax(0,1fr)_minmax(170px,.62fr)_minmax(144px,auto)]" onSubmit={(event) => { event.preventDefault(); addSingle(); }}>
      <div className="min-w-0">
        <Label htmlFor="saleNumber" className="flex h-5 items-center">{multiple ? "Teclea los números" : "Número"}</Label>
        <div className="relative mt-2">
          <Input ref={numberRef} id="saleNumber" inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={number} disabled={disabled || (fixedAmount && !validAmount) || ticketFull} onChange={(event) => handleNumberChange(event.target.value)} placeholder={multiple ? "00  ·  2 dígitos por número" : "00"} aria-describedby="sale-number-help" className="h-14 pr-24 font-mono text-xl tracking-widest" />
          {multiple ? <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Auto-fijado</span> : null}
        </div>
        <p id="sale-number-help" className={`mt-1.5 text-[11px] ${capacityReached || ticketFull ? "text-danger" : "text-muted-foreground"}`}>{capacityReached ? "Se alcanzó el máximo: algunos números no pudieron fijarse." : ticketFull ? "El ticket alcanzó el máximo de 100 números." : multiple ? "Cada par pasa directo a la lista y el campo queda listo para el siguiente." : "Introduce exactamente dos dígitos."}</p>
      </div>

      <div className="min-w-0">
        <Label htmlFor={multiple && !fixedAmount ? undefined : "saleAmount"} className="flex h-5 items-center">Premio por número</Label>
        {multiple && !fixedAmount ? <div className="mt-2 flex h-14 items-center rounded-xl border border-dashed border-amber-500/30 bg-amber-500/6 px-4 text-xs leading-4 text-amber-800 dark:text-amber-200"><span>Se completa en la lista después de fijar cada número.</span></div> : <Input id="saleAmount" type="number" inputMode="decimal" min={0.01} max={999999} step={0.01} value={amount} disabled={disabled} onChange={(event) => setAmount(event.target.value)} className="mt-2 h-14 font-mono text-lg" />}
      </div>

      <div className="min-w-0">
        <span className="flex h-5 items-center text-sm font-medium text-foreground">Ticket</span>
        {multiple ? <div className="mt-2 flex h-14 min-w-36 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 text-xs font-medium text-emerald-700 dark:text-emerald-300"><Layers3 className="mr-2 h-4 w-4" />{items.length} fijados</div> : <Button type="submit" className="mt-2 h-14 w-full min-w-36 gap-2 px-4" disabled={!canAddSingle}><Plus className="h-5 w-5" /><span>Agregar</span></Button>}
      </div>
    </form>

    {(!multiple || fixedAmount) ? <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap" aria-label="Montos rápidos">{QUICK_AMOUNTS.map((value) => <button key={value} type="button" onClick={() => { setAmount(String(value)); focusNumber(); }} disabled={disabled} className={`h-8 shrink-0 rounded-lg border px-3 font-mono text-xs transition disabled:opacity-50 ${parsedAmount === value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"}`}>{value} mil</button>)}</div> : null}

    {items.length ? <div className="mt-3 rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-medium text-foreground">Números fijados</p><p className="mt-0.5 text-[10px] text-muted-foreground">Edita aquí el monto de cada jugada.</p></div><span className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[10px] text-muted-foreground" aria-live="polite">{items.length}/100</span></div>
      <div className="mt-3 grid max-h-36 grid-cols-1 gap-2 overflow-y-auto pr-1 min-[420px]:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => <div key={item.number} className={`flex items-center gap-2 rounded-lg border bg-background p-1.5 ${item.prizeMiles === null ? "border-amber-500/40" : "border-border"}`}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary font-mono text-xs font-semibold text-primary-foreground">{item.number}</span>
          <label className="min-w-0 flex-1"><span className="sr-only">Monto para {item.number}</span><Input ref={(node) => { if (node) amountRefs.current.set(item.number, node); else amountRefs.current.delete(item.number); }} type="number" inputMode="decimal" min={0.01} max={999999} step={0.01} placeholder="Monto" value={item.prizeMiles ?? ""} onChange={(event) => updateItem(item.number, event.target.value === "" ? null : Number(event.target.value))} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); focusNextPendingAmount(item.number); } }} className="h-9 px-2 font-mono text-xs" /></label>
          <button type="button" aria-label={`Quitar número ${item.number}`} onClick={() => { setCapacityReached(false); removeItem(item.number); }} className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="h-3.5 w-3.5" /></button>
        </div>)}
      </div>
    </div> : null}
  </section>;
}
