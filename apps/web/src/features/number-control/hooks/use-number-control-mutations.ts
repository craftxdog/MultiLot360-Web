import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { numberControlKeys } from "../queries/number-control.queries";
import { numberControlService } from "../services/number-control.service";
import type { CreateBlockedNumbersInput, CreateNumberLimitsInput, UpdateNumberLimitInput } from "../types/number-control.types";

export function useNumberControlMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: numberControlKeys.all });

  const createLimits = useMutation({
    mutationFn: (input: CreateNumberLimitsInput) => numberControlService.createLimits(input),
    onSuccess: (limits) => {
      limits.forEach((limit) => queryClient.setQueryData(numberControlKeys.limit(limit.id), limit));
      void invalidate();
      toast.success(`${limits.length} ${limits.length === 1 ? "límite creado" : "límites creados"} correctamente.`);
    },
    onError: (error) => toast.error(error.message),
  });

  const updateLimit = useMutation({
    mutationFn: ({ limitId, input }: { limitId: string; input: UpdateNumberLimitInput }) => numberControlService.updateLimit(limitId, input),
    onSuccess: (limit) => {
      queryClient.setQueryData(numberControlKeys.limit(limit.id), limit);
      void invalidate();
      toast.success("Límite actualizado correctamente.");
    },
    onError: (error) => toast.error(error.message),
  });

  const expireLimit = useMutation({
    mutationFn: ({ limitId, expiresOn }: { limitId: string; expiresOn: string }) => numberControlService.expireLimit(limitId, expiresOn),
    onSuccess: (limit) => {
      queryClient.setQueryData(numberControlKeys.limit(limit.id), limit);
      void invalidate();
      toast.success("Límite finalizado correctamente.");
    },
    onError: (error) => toast.error(error.message),
  });

  const createBlockedNumbers = useMutation({
    mutationFn: (input: CreateBlockedNumbersInput) => numberControlService.createBlockedNumbers(input),
    onSuccess: (blocks) => {
      blocks.forEach((block) => queryClient.setQueryData(numberControlKeys.blockedDetail(block.id), block));
      void invalidate();
      toast.success(`${blocks.length} ${blocks.length === 1 ? "número bloqueado" : "números bloqueados"} correctamente.`);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteBlockedNumber = useMutation({
    mutationFn: (blockId: string) => numberControlService.deleteBlockedNumber(blockId),
    onSuccess: (block) => {
      queryClient.removeQueries({ queryKey: numberControlKeys.blockedDetail(block.id) });
      void invalidate();
      toast.success(`El número ${block.number} volvió a estar disponible.`);
    },
    onError: (error) => toast.error(error.message),
  });

  return { createLimits, updateLimit, expireLimit, createBlockedNumbers, deleteBlockedNumber };
}
