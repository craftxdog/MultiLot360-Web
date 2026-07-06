import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { numberControlKeys } from "@/features/number-control/queries/number-control.queries";
import { salesKeys } from "../queries/sales.queries";
import { salesService } from "../services/sales.service";
import { useSalesWorkspaceStore } from "../store/sales-workspace.store";
import type { CreateSaleInput } from "../types/sales.types";

export function useSalesMutations() {
  const client = useQueryClient();
  const clearDraft = useSalesWorkspaceStore((state) => state.clearDraft);
  const closeCart = useSalesWorkspaceStore((state) => state.closeCart);
  const openSaleDetails = useSalesWorkspaceStore((state) => state.openSaleDetails);
  const invalidate = () => client.invalidateQueries({ queryKey: salesKeys.all });

  const createSale = useMutation({
    mutationFn: (input: CreateSaleInput) => salesService.createSale(input),
    onSuccess: (sale) => {
      client.setQueryData(salesKeys.detail(sale.id), sale);
      clearDraft();
      closeCart();
      openSaleDetails(sale.id);
      void invalidate();
      toast.success(`Venta #${sale.id.slice(0, 8).toUpperCase()} registrada.`);
    },
    onError: (error) => toast.error(error.message),
  });
  const voidSale = useMutation({
    mutationFn: ({ saleId, reason }: { saleId: string; reason: string }) => salesService.voidSale(saleId, reason),
    onSuccess: (sale) => {
      client.setQueryData(salesKeys.detail(sale.id), sale);
      void invalidate();
      void client.invalidateQueries({ queryKey: numberControlKeys.all });
      toast.success("Venta anulada correctamente.");
    },
    onError: (error) => toast.error(error.message),
  });
  const updateVoidPolicy = useMutation({
    mutationFn: (windowMinutes: number) => salesService.updateVoidPolicy(windowMinutes),
    onSuccess: (policy) => {
      client.setQueryData(salesKeys.voidPolicy(), policy);
      toast.success("Política de anulación actualizada.");
    },
    onError: (error) => toast.error(error.message),
  });
  return { createSale, voidSale, updateVoidPolicy };
}
