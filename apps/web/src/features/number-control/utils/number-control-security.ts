import { isTrustedMutationOrigin } from "@/lib/security/mutation-origin";

export function isTrustedNumberControlOrigin(requestUrl: string, origin: string | null) {
  return isTrustedMutationOrigin(requestUrl, origin);
}
