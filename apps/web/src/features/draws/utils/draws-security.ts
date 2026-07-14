import { isTrustedMutationOrigin } from "@/lib/security/mutation-origin";

export function isSameOriginMutation(requestUrl: string, origin: string | null) {
  return isTrustedMutationOrigin(requestUrl, origin);
}
