"use client";

import { useSalesWorkspaceStore } from "../store/sales-workspace.store";
import { VoidSaleDialogContent } from "./void-sale-dialog-content";

export function VoidSaleDialog() {
  const saleId = useSalesWorkspaceStore((state) => state.pendingVoidSaleId);
  if (!saleId) return null;
  return <VoidSaleDialogContent key={saleId} saleId={saleId} />;
}
