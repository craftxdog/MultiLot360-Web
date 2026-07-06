"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, LockKeyhole, ShieldCheck, TicketCheck, UserRoundCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { activeDrawShiftsQueryOptions } from "@/features/draws/queries/draw.queries";
import { useDrawClock } from "@/features/draws/hooks/use-draw-clock";
import { sellerInvitationsQueryOptions } from "@/features/sellers/queries/seller.queries";
import { useSalesMutations } from "../hooks/use-sales-mutations";
import { createSaleSchema } from "../schemas/sales.schema";
import { useSalesWorkspaceStore } from "../store/sales-workspace.store";
import { getSalesToday } from "../utils/sales-formatters";
import { formatSalesShiftLabel, getSaleableSalesShifts, selectCurrentSalesShift } from "../utils/sales-shift";
import { FastSaleEntry } from "./fast-sale-entry";
import { MobileSaleTicket } from "./mobile-sale-ticket";
import { SaleCart } from "./sale-cart";
import { SaleShiftClock } from "./sale-shift-clock";
import { SalesSelect } from "./sales-select";

const safeguards = [
  { label: "Turno abierto", icon: CheckCircle2 },
  { label: "Cuenta autorizada", icon: ShieldCheck },
  { label: "Bloqueos", icon: LockKeyhole },
  { label: "Límites", icon: AlertTriangle },
];

export function SaleStation() {
  const user = useCurrentUser();
  const now = useDrawClock();
  const permissions = user.data?.permissions ?? [];
  const isAdmin = user.data?.role.name.toUpperCase() === "ADMIN";
  const canReadShifts = permissions.includes("turnos.read");
  const canReadSellers = permissions.includes("usuarios.read");
  const shifts = useQuery({
    ...activeDrawShiftsQueryOptions({ page: 1, limit: 50, date: getSalesToday(), sortBy: "configurationTime", sortDirection: "asc" }),
    enabled: canReadShifts,
  });
  const sellers = useQuery({
    ...sellerInvitationsQueryOptions({ page: 1, limit: 100, status: "USADO" }),
    enabled: isAdmin && canReadSellers,
  });
  const items = useSalesWorkspaceStore((state) => state.items);
  const selectedShiftId = useSalesWorkspaceStore((state) => state.selectedShiftId);
  const selectedSellerId = useSalesWorkspaceStore((state) => state.selectedSellerId);
  const selectShift = useSalesWorkspaceStore((state) => state.selectShift);
  const selectSeller = useSalesWorkspaceStore((state) => state.selectSeller);
  const { createSale } = useSalesMutations();

  const shiftOptions = shifts.data?.shifts ?? [];
  const saleableShifts = now === undefined ? [] : getSaleableSalesShifts(shiftOptions, now);
  const currentShift = now === undefined ? null : selectCurrentSalesShift(shiftOptions, now);
  const adminShift = selectedShiftId ? saleableShifts.find((shift) => shift.id === selectedShiftId) ?? null : null;
  const effectiveShift = isAdmin ? adminShift ?? currentShift : currentShift;
  const sellerOptions = sellers.data?.invitations ?? [];
  const effectiveSellerId = isAdmin && selectedSellerId && (canReadSellers ? sellerOptions.some((seller) => seller.sellerId === selectedSellerId) : createSaleSchema.shape.sellerId.safeParse(selectedSellerId).success) ? selectedSellerId : null;
  const canSellAsSelf = Boolean(user.data?.seller?.id);
  const accountReady = isAdmin ? canSellAsSelf || Boolean(effectiveSellerId) : canSellAsSelf;
  const amountsReady = items.length > 0 && items.every((item) => createSaleSchema.shape.items.element.safeParse(item).success);

  async function submit() {
    const payload = {
      sellerId: isAdmin && effectiveSellerId ? effectiveSellerId : undefined,
      shiftId: effectiveShift?.id ?? "",
      items,
    };
    const parsed = createSaleSchema.safeParse(payload);
    if (!parsed.success) return;
    await createSale.mutateAsync(parsed.data).catch(() => undefined);
  }

  const unavailable = canReadShifts && !shifts.isLoading && now !== undefined && !effectiveShift;
  const canSubmit = amountsReady && Boolean(effectiveShift) && accountReady && !createSale.isPending;

  return <div className="space-y-4 pb-24 xl:pb-0">
    <section className="grid gap-3 rounded-2xl border border-border bg-card p-4 lg:grid-cols-2">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Turno de venta</p>
        {isAdmin ? canReadShifts ? <SalesSelect className="mt-2" ariaLabel="Turno de venta" value={effectiveShift?.id ?? ""} onChange={(value) => selectShift(value || null)} options={[{ value: "", label: shifts.isLoading || now === undefined ? "Buscando turno actual…" : "No hay turno disponible" }, ...saleableShifts.map((shift) => ({ value: shift.id, label: formatSalesShiftLabel(shift) }))]} /> : <Input className="mt-2" aria-label="Identificador del turno" placeholder="UUID del turno abierto" value={selectedShiftId ?? ""} onChange={(event) => selectShift(event.target.value || null)} /> : <div className="mt-2 flex min-h-11 items-center gap-3 rounded-xl border border-border bg-muted/30 px-4"><LockKeyhole className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /><div><p className="text-sm font-medium text-foreground">{effectiveShift ? formatSalesShiftLabel(effectiveShift) : shifts.isLoading || now === undefined ? "Buscando turno actual…" : "Sin turno de venta"}</p><p className="text-[10px] text-muted-foreground">Se actualiza automáticamente según la hora de Managua.</p></div></div>}
        {!canReadShifts ? <p className="mt-2 text-xs text-danger">El rol necesita permiso `turnos.read` para vender con asignación segura.</p> : null}
        {unavailable ? <p className="mt-2 text-xs text-danger">No hay un turno abierto de 11 a. m., 3 p. m. o 9 p. m. dentro de su horario de venta.</p> : null}
      </div>

      {isAdmin ? <div>
        <p className="text-xs font-medium text-muted-foreground">Registrar venta para</p>
        {canReadSellers ? <SalesSelect className="mt-2" ariaLabel="Vendedor" value={effectiveSellerId ?? ""} onChange={(value) => selectSeller(value || null)} options={[{ value: "", label: canSellAsSelf ? `Mi cuenta · ${user.data?.seller?.name ?? user.data?.username}` : "Selecciona un vendedor" }, ...sellerOptions.map((seller) => ({ value: seller.sellerId, label: seller.sellerName }))]} /> : <Input className="mt-2" aria-label="Identificador del vendedor" placeholder="UUID del vendedor" value={selectedSellerId ?? ""} onChange={(event) => selectSeller(event.target.value || null)} />}
        {!accountReady ? <p className="mt-2 text-xs text-danger">Selecciona un vendedor. Esta cuenta administrativa no tiene perfil de vendedor propio.</p> : <p className="mt-2 text-[10px] text-muted-foreground">Puedes usar tu perfil de vendedor o representar a otro vendedor habilitado.</p>}
      </div> : <div>
        <p className="text-xs font-medium text-muted-foreground">Cuenta de venta</p>
        <div className="mt-2 flex min-h-11 items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4"><UserRoundCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-300" /><div><p className="text-sm font-medium text-foreground">{user.data?.seller?.name ?? user.data?.username ?? "Vendedor"}</p><p className="text-[10px] text-muted-foreground">La venta queda fijada a tu propia cuenta.</p></div></div>
        {!accountReady ? <p className="mt-2 text-xs text-danger">Tu usuario no tiene un perfil de vendedor activo asociado.</p> : null}
      </div>}
    </section>

    {effectiveShift && now !== undefined ? <SaleShiftClock shift={effectiveShift} now={now} automatic={!isAdmin} /> : null}

    <section className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Validaciones automáticas">
      {safeguards.map(({ label, icon: Icon }) => <div key={label} className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground"><Icon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />{label}<span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" /></div>)}
    </section>

    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,.75fr)]">
      <div className="sticky top-[4.5rem] z-20 xl:static"><FastSaleEntry disabled={unavailable || !accountReady || createSale.isPending} /></div>
      <aside className="sticky top-[4.5rem] hidden space-y-3 xl:block">
        <SaleCart />
        {!amountsReady && items.length ? <div role="status" className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">Completa un monto válido para cada número antes de registrar.</div> : null}
        {createSale.error ? <div role="alert" className="rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm text-danger">{createSale.error.message}<p className="mt-1 text-xs opacity-80">El ticket se conservó para que puedas corregirlo.</p></div> : null}
        <Button className="h-14 w-full gap-2 text-base" disabled={!canSubmit} onClick={submit}><TicketCheck className="h-5 w-5" />{createSale.isPending ? "Validando y registrando…" : "Registrar ticket"}</Button>
      </aside>
    </div>

    <MobileSaleTicket canSubmit={canSubmit} error={createSale.error} onSubmit={submit} pending={createSale.isPending} />
  </div>;
}
