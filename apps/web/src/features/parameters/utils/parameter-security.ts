import { isTrustedMutationOrigin } from "@/lib/security/mutation-origin";

export function isTrustedParameterOrigin(
  requestUrl: string,
  origin: string | null,
) {
  return isTrustedMutationOrigin(requestUrl, origin);
}
