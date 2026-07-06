import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { parameterKeys } from "../queries/parameter.queries";
import { parametersService } from "../services/parameters.service";
import type { UpsertSystemParameterInput } from "../types/parameter.types";

export function useParameterMutations() {
  const queryClient = useQueryClient();

  const upsertParameter = useMutation({
    mutationFn: (input: UpsertSystemParameterInput) =>
      parametersService.upsertParameter(input),
    onSuccess: async (parameter) => {
      queryClient.setQueryData(parameterKeys.detail(parameter.key), parameter);
      await queryClient.invalidateQueries({ queryKey: parameterKeys.all });
      toast.success("Parámetro guardado", {
        description: `${parameter.key} ya está activo en la configuración del sistema.`,
      });
    },
    onError: (error) => toast.error(error.message),
  });

  return { upsertParameter };
}
