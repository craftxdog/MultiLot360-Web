import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sellerKeys } from "../queries/seller.queries";
import { sellersService } from "../services/sellers.service";
import type { CreateSellerInvitationPayload } from "../types/seller.types";

export function useSellerMutations() {
  const queryClient = useQueryClient();

  const invalidateSellerData = () =>
    queryClient.invalidateQueries({ queryKey: sellerKeys.all });

  const createInvitation = useMutation({
    mutationFn: (input: CreateSellerInvitationPayload) =>
      sellersService.createInvitation(input),
    onSuccess: async () => {
      await invalidateSellerData();
      toast.success("Invitación enviada", {
        description:
          "El vendedor recibió un código y un enlace seguro de activación.",
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const resendAccessCode = useMutation({
    mutationFn: (email: string) => sellersService.resendAccessCode(email),
    onSuccess: async () => {
      await invalidateSellerData();
      toast.success("Nuevo código enviado", {
        description: "El código anterior dejó de ser válido.",
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const revokeInvitation = useMutation({
    mutationFn: (invitationId: string) =>
      sellersService.revokeInvitation(invitationId),
    onSuccess: async () => {
      await invalidateSellerData();
      toast.success("Invitación revocada");
    },
    onError: (error) => toast.error(error.message),
  });

  const resetPassword = useMutation({
    mutationFn: sellersService.adminResetPassword,
    onSuccess: (response) => toast.success(`Contraseña de @${response.targetUser.username} actualizada`, {
      description: "Las sesiones de refresh anteriores fueron revocadas.",
    }),
    onError: (error) => toast.error(error.message),
  });

  return { createInvitation, resendAccessCode, revokeInvitation, resetPassword };
}
