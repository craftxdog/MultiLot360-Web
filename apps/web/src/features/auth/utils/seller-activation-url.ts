import { sellerActionTokenSchema } from "../schemas/seller-access.schema";

export type SellerActivationParams = {
  actionToken?: string;
  invalidToken: boolean;
  initialEmail?: string;
  initialAccessCode?: string;
  next?: string;
};

export function parseSellerActivationParams(
  searchParams: Pick<URLSearchParams, "get">,
): SellerActivationParams {
  const rawToken = searchParams.get("token");
  const tokenResult = rawToken === null
    ? null
    : sellerActionTokenSchema.safeParse(rawToken);
  const email = searchParams.get("email")?.trim().toLowerCase();
  const accessCode = searchParams.get("code")?.replace(/\D/g, "").slice(0, 6);
  const next = searchParams.get("next") ?? undefined;

  return {
    ...(tokenResult?.success ? { actionToken: tokenResult.data } : {}),
    invalidToken: tokenResult !== null && !tokenResult.success,
    ...(email ? { initialEmail: email } : {}),
    ...(accessCode ? { initialAccessCode: accessCode } : {}),
    ...(next ? { next } : {}),
  };
}

export function cleanSellerActivationUrl(
  history: Pick<History, "replaceState" | "state">,
  location: Pick<Location, "pathname">,
) {
  history.replaceState(history.state, "", location.pathname);
}
