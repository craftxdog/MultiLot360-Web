import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { drawsService } from "../services/draws.service";
import { drawKeys } from "../queries/draw.queries";
import type {
  CreateDrawConfigurationInput,
  HardDeleteDrawConfigurationInput,
  SoftDeleteDrawConfigurationInput,
  UpdateDrawConfigurationInput,
} from "../types/draws.types";

export function useDrawConfigurationMutations() {
  const queryClient = useQueryClient();

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: drawKeys.all });
  }

  const createConfiguration = useMutation({
    mutationFn: (input: CreateDrawConfigurationInput) =>
      drawsService.createConfiguration(input),
    onSuccess: (configuration) => {
      queryClient.setQueryData(
        drawKeys.configuration(configuration.id),
        configuration,
      );
      void invalidate();
      toast.success("Configuración creada correctamente.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateConfiguration = useMutation({
    mutationFn: ({
      configurationId,
      input,
    }: {
      configurationId: string;
      input: UpdateDrawConfigurationInput;
    }) => drawsService.updateConfiguration(configurationId, input),
    onSuccess: (configuration) => {
      queryClient.setQueryData(
        drawKeys.configuration(configuration.id),
        configuration,
      );
      void invalidate();
      toast.success("Configuración actualizada correctamente.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const softDeleteConfiguration = useMutation({
    mutationFn: ({
      configurationId,
      input,
    }: {
      configurationId: string;
      input: SoftDeleteDrawConfigurationInput;
    }) => drawsService.softDeleteConfiguration(configurationId, input),
    onSuccess: (result) => {
      void invalidate();
      toast.success(result.mode === "SOFT" ? "Sorteo desactivado sin borrar historial." : "Configuración eliminada.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const hardDeleteConfiguration = useMutation({
    mutationFn: ({
      configurationId,
      input,
    }: {
      configurationId: string;
      input: HardDeleteDrawConfigurationInput;
    }) => drawsService.hardDeleteConfiguration(configurationId, input),
    onSuccess: () => {
      void invalidate();
      toast.success("Sorteo eliminado definitivamente.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    createConfiguration,
    updateConfiguration,
    softDeleteConfiguration,
    hardDeleteConfiguration,
  };
}
