import { isTrustedMutationOrigin } from "@/lib/security/mutation-origin";

export function isTrustedSalesOrigin(requestUrl: string, origin: string | null) {
  return isTrustedMutationOrigin(requestUrl, origin);
}

export function canSellWithOwnAccount(isAdmin: boolean, sellerId?: string) {
  return isAdmin || Boolean(sellerId);
}
