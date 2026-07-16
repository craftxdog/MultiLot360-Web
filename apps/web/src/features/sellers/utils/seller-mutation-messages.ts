export type SellerMutationOperation =
  | "create-invitation"
  | "resend-access-code";

const SELLER_MUTATION_MESSAGES: Record<SellerMutationOperation, string> = {
  "create-invitation":
    "No se pudo enviar la invitación. Intenta nuevamente.",
  "resend-access-code":
    "No se pudo enviar el nuevo código. Intenta nuevamente.",
};

export function getSellerMutationErrorMessage(
  operation: SellerMutationOperation,
) {
  return SELLER_MUTATION_MESSAGES[operation];
}
