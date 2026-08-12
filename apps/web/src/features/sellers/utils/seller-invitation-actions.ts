import type { SellerInvitationStatus } from "../types/seller.types";

export function canResendSellerInvitation(status: SellerInvitationStatus) {
  return status !== "USADO";
}

export function getSellerInvitationResendLabel(
  status: SellerInvitationStatus,
) {
  return status === "PENDIENTE" ? "Reenviar" : "Renovar";
}
