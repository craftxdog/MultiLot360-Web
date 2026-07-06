"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import type { SalesTab, SalesWorkspaceQuery } from "../types/sales.types";
import { buildSalesWorkspaceHref, parseSalesWorkspaceQuery } from "../utils/sales-query";
import { SaleDetailsDrawer } from "./sale-details-drawer";
import { SaleStation } from "./sale-station";
import { SalesHeader } from "./sales-header";
import { SalesList } from "./sales-list";
import { SalesOverview } from "./sales-overview";
import { SalesPolicyDrawer } from "./sales-policy-drawer";
import { SalesTabs } from "./sales-tabs";
import { SalesToolbar } from "./sales-toolbar";
import { VoidSaleDialog } from "./void-sale-dialog";

export function SalesView({ defaultView }: { defaultView: SalesTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useCurrentUser();
  const query = useMemo(() => parseSalesWorkspaceQuery(new URLSearchParams(searchParams.toString()), defaultView), [defaultView, searchParams]);
  const permissions = user.data?.permissions ?? [];
  const available: SalesTab[] = [permissions.includes("ventas.create") ? "sell" : null, permissions.includes("ventas.read") ? "history" : null].filter((value): value is SalesTab => value !== null);
  const activeTab = available.includes(query.view) ? query.view : (available[0] ?? defaultView);
  const effective = activeTab === query.view ? query : { ...query, view: activeTab };
  const update = (changes: Partial<SalesWorkspaceQuery>) => router.replace(buildSalesWorkspaceHref(pathname, effective, { page: 1, ...changes }), { scroll: false });
  const canRead = permissions.includes("ventas.read");
  const canUpdate = permissions.includes("ventas.update");
  const isAdmin = user.data?.role.name.toUpperCase() === "ADMIN";
  const paginationParams = { view: activeTab, limit: query.limit === 10 ? undefined : query.limit, sellerId: query.sellerId, shiftId: query.shiftId, date: query.date, drawCode: query.drawCode, number: query.number, status: query.status };

  return <div className="mx-auto max-w-7xl space-y-6"><SalesHeader isAdmin={isAdmin} canUpdate={canUpdate} />{canRead ? <div className={activeTab === "sell" ? "hidden md:block" : undefined}><SalesOverview /></div> : null}<section className="rounded-2xl border border-border bg-card/85 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.035)] backdrop-blur-sm" aria-label="Espacio de ventas"><div className="flex flex-col gap-4 border-b border-border pb-4 xl:flex-row xl:items-center xl:justify-between"><SalesTabs value={activeTab} available={available} onChange={(view) => update({ view, sellerId: undefined, shiftId: undefined, date: undefined, drawCode: undefined, number: undefined, status: undefined })} />{activeTab === "history" ? <div className="min-w-0 flex-1 xl:max-w-4xl"><SalesToolbar query={effective} onChange={update} /></div> : <p className="text-xs text-muted-foreground">Validación atómica contra turno, bloqueos y límites</p>}</div><div className="mt-5">{activeTab === "sell" ? <SaleStation /> : <SalesList query={{ page: query.page, limit: query.limit, sellerId: query.sellerId, shiftId: query.shiftId, date: query.date, drawCode: query.drawCode, number: query.number, status: query.status, sortBy: "createdAt", sortDirection: "desc" }} basePath={pathname} params={paginationParams} canUpdate={canUpdate} />}</div></section>{canRead ? <SaleDetailsDrawer canUpdate={canUpdate} /> : null}{canUpdate ? <VoidSaleDialog /> : null}{isAdmin && canUpdate ? <SalesPolicyDrawer /> : null}</div>;
}
