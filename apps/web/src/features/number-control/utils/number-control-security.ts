export function isTrustedNumberControlOrigin(requestUrl: string, origin: string | null) {
  if (!origin) return false;

  try {
    return new URL(requestUrl).origin === new URL(origin).origin;
  } catch {
    return false;
  }
}
