export function isTrustedParameterOrigin(
  requestUrl: string,
  origin: string | null,
) {
  if (!origin) return false;

  try {
    const request = new URL(requestUrl);
    const source = new URL(origin);

    if (request.origin === source.origin) return true;

    const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
    return (
      request.protocol === source.protocol &&
      request.port === source.port &&
      loopbackHosts.has(request.hostname) &&
      loopbackHosts.has(source.hostname)
    );
  } catch {
    return false;
  }
}
