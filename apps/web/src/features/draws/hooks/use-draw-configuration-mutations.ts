import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { drawsService } from "../services/draws.service";
import { drawKeys } from "../queries/draw.queries";
import type {
  CreateDrawConfigurationInput,
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

  return {
    createConfiguration,
    updateConfiguration,
  };
}
