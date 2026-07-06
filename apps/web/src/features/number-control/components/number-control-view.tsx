"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import type { NumberControlTab, NumberControlWorkspaceQuery } from "../types/number-control.types";
import { buildNumberControlWorkspaceHref, parseNumberControlWorkspaceQuery } from "../utils/number-control-query";
import { BlockedNumberDrawer } from "./blocked-number-drawer";
import { BlockedNumbersList } from "./blocked-numbers-list";
import { NumberControlConfirmations } from "./number-control-confirmations";
import { NumberControlHeader } from "./number-control-header";
import { NumberControlOverview } from "./number-control-overview";
import { NumberControlTabs } from "./number-control-tabs";
import { NumberControlToolbar } from "./number-control-toolbar";
import { NumberLimitDrawer } from "./number-limit-drawer";
import { NumberLimitsList } from "./number-limits-list";

export function NumberControlView({ defaultView }: { defaultView: NumberControlTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useCurrentUser();
  const query = useMemo(() => parseNumberControlWorkspaceQuery(new URLSearchParams(searchParams.toString()), defaultView), [defaultView, searchParams]);
  const permissions = user.data?.permissions ?? [];
  const available: NumberControlTab[] = [permissions.includes("limites_numero.read") ? "limits" : null, permissions.includes("numeros_bloqueados.read") ? "blocked" : null].filter((value): value is NumberControlTab => value !== null);
  const activeTab = available.includes(query.view) ? query.view : (available[0] ?? defaultView);
  const effectiveQuery = activeTab === query.view ? query : { ...query, view: activeTab };
  function update(changes: Partial<NumberControlWorkspaceQuery>) {
    router.replace(buildNumberControlWorkspaceHref(pathname, effectiveQuery, { page: 1, ...changes }), { scroll: false });
  }
  const params = { view: activeTab, limit: query.limit === 10 ? undefined : query.limit, number: query.number, active: query.active === undefined ? undefined : String(query.active), sellerScope: query.sellerScope, drawScope: query.drawScope, scope: query.scope, date: query.date, drawCode: query.drawCode };
  const canCreateLimit = permissions.includes("limites_numero.create");
  const canUpdateLimit = permissions.includes("limites_numero.update");
  const canCreateBlock = permissions.includes("numeros_bloqueados.create");
  const canDeleteBlock = permissions.includes("numeros_bloqueados.delete");

  return <div className="mx-auto max-w-7xl space-y-6">
    <NumberControlHeader canCreateLimit={canCreateLimit} canCreateBlock={canCreateBlock} />
    {available.length === 2 ? <NumberControlOverview /> : null}
    <section className="rounded-2xl border border-border bg-card/85 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.035)] backdrop-blur-sm" aria-label="Espacio de control numérico">
      <div className="flex flex-col gap-4 border-b border-border pb-4 xl:flex-row xl:items-center xl:justify-between"><NumberControlTabs value={activeTab} available={available} onChange={(view) => update({ view, number: undefined, active: undefined, sellerScope: undefined, drawScope: undefined, scope: undefined, date: undefined, drawCode: undefined })} /><div className="min-w-0 flex-1 xl:max-w-4xl"><NumberControlToolbar tab={activeTab} query={effectiveQuery} onChange={update} /></div></div>
      <div className="mt-5">{activeTab === "limits" ? <NumberLimitsList query={{ page: query.page, limit: query.limit, number: query.number, active: query.active, sellerScope: query.sellerScope, drawScope: query.drawScope, validOn: query.date, drawCode: query.drawCode, sortBy: "createdAt", sortDirection: "desc" }} basePath={pathname} params={params} canUpdate={canUpdateLimit} /> : <BlockedNumbersList query={{ page: query.page, limit: query.limit, number: query.number, scope: query.scope, date: query.date, drawCode: query.drawCode, sortBy: "createdAt", sortDirection: "desc" }} basePath={pathname} params={params} canDelete={canDeleteBlock} />}</div>
    </section>
    {canCreateLimit || canUpdateLimit ? <NumberLimitDrawer /> : null}
    {canCreateBlock || permissions.includes("numeros_bloqueados.read") ? <BlockedNumberDrawer canDelete={canDeleteBlock} /> : null}
    {canUpdateLimit || canDeleteBlock ? <NumberControlConfirmations /> : null}
  </div>;
}
