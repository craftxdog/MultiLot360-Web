export const authCookieNames = {
  access: process.env.AUTH_ACCESS_COOKIE ?? "ml_access_token",
  refresh: process.env.AUTH_REFRESH_COOKIE ?? "ml_refresh_token",
  tenant: process.env.AUTH_TENANT_COOKIE ?? "ml_tenant_id",
} as const;

const sharedCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  priority: "high" as const,
};

export function getAccessCookieOptions(expiresIn: number) {
  return {
    ...sharedCookieOptions,
    maxAge: Math.max(1, expiresIn),
  };
}

export function getRefreshCookieOptions() {
  return {
    ...sharedCookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function getTenantCookieOptions() {
  return {
    ...sharedCookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function getExpiredCookieOptions() {
  return {
    ...sharedCookieOptions,
    maxAge: 0,
    expires: new Date(0),
  };
}
