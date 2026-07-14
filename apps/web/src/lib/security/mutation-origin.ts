const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

function parseOrigin(value: string | null | undefined) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isEquivalentLoopbackOrigin(left: string, right: string) {
  const leftUrl = new URL(left);
  const rightUrl = new URL(right);

  return (
    leftUrl.protocol === rightUrl.protocol &&
    leftUrl.port === rightUrl.port &&
    loopbackHosts.has(leftUrl.hostname) &&
    loopbackHosts.has(rightUrl.hostname)
  );
}

/**
 * Validates browser mutations against both the internal request URL and the
 * public application URL. In a standalone deployment behind a reverse proxy,
 * Request.url can contain the container origin while Origin contains the
 * public HTTPS origin.
 */
export function isTrustedMutationOrigin(
  requestUrl: string,
  origin: string | null,
  configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL,
) {
  const sourceOrigin = parseOrigin(origin);
  if (!sourceOrigin) return false;

  const trustedOrigins = [parseOrigin(requestUrl), parseOrigin(configuredAppUrl)].filter(
    (candidate): candidate is string => candidate !== null,
  );

  return trustedOrigins.some(
    (trustedOrigin) =>
      sourceOrigin === trustedOrigin ||
      isEquivalentLoopbackOrigin(sourceOrigin, trustedOrigin),
  );
}
