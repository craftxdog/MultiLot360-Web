"use client";

import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSale } from "../hooks/use-sales";
import { useSalesWorkspaceStore } from "../store/sales-workspace.store";
import { SaleDetailContent } from "./sale-detail-content";
import { SalesDrawer } from "./sales-drawer";

export function SaleDetailsDrawer({ canUpdate }: { canUpdate: boolean }) {
  const saleId = useSalesWorkspaceStore((state) => state.selectedSaleId);
  const close = useSalesWorkspaceStore((state) => state.closeSaleDetails);
  const requestVoid = useSalesWorkspaceStore((state) => state.requestVoid);
  const result = useSale(saleId ?? "");
  return <SalesDrawer open={Boolean(saleId)} onClose={close} title="Detalle de venta" description="Ticket, jugadas y trazabilidad operativa completa.">{result.isLoading ? <div className="h-96 animate-pulse rounded-2xl bg-muted" /> : null}{result.error ? <div role="alert" className="rounded-xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger">{result.error.message}</div> : null}{result.data ? <><SaleDetailContent sale={result.data} />{canUpdate && result.data.status === "ACTIVA" && result.data.shift?.status === "ABIERTO" ? <Button variant="danger" className="mt-5 w-full gap-2" onClick={() => { requestVoid(result.data.id); close(); }}><Ban className="h-4 w-4" />Anular venta</Button> : null}</> : null}</SalesDrawer>;
}
