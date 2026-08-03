import {
  recoveryTokenHashSchema,
  requestPasswordResetSchema,
} from "../schemas/password-reset.schema";

export type PasswordResetUrlState = {
  email: string;
  validEmail: boolean;
};

export function parsePasswordResetParams(
  searchParams: Pick<URLSearchParams, "get">,
): PasswordResetUrlState {
  const result = requestPasswordResetSchema.safeParse({
    email: searchParams.get("email"),
  });

  return result.success
    ? { email: result.data.email, validEmail: true }
    : { email: "", validEmail: false };
}

export function parsePasswordResetFragment(hash: string): string | null {
  const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
  const tokenHash = new URLSearchParams(fragment).get("recovery_token");
  const result = recoveryTokenHashSchema.safeParse(tokenHash);

  return result.success ? result.data : null;
}

export function cleanPasswordResetUrl(
  history: Pick<History, "replaceState" | "state">,
  location: Pick<Location, "pathname">,
) {
  history.replaceState(history.state, "", location.pathname);
}
