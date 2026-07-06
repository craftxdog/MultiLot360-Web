type JwtPayload = {
  exp?: number;
};

export function getJwtExpiration(token: string) {
  try {
    const encodedPayload = token.split(".")[1];

    if (!encodedPayload) {
      return null;
    }

    const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded)) as JwtPayload;

    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function shouldRefreshAccessToken(
  token: string,
  nowInSeconds = Math.floor(Date.now() / 1000),
  thresholdInSeconds = 60,
) {
  const expiresAt = getJwtExpiration(token);

  return expiresAt === null || expiresAt <= nowInSeconds + thresholdInSeconds;
}
