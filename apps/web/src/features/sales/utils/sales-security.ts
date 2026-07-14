import { isTrustedMutationOrigin } from "@/lib/security/mutation-origin";

export function isTrustedSalesOrigin(requestUrl: string, origin: string | null) {
  return isTrustedMutationOrigin(requestUrl, origin);
}
