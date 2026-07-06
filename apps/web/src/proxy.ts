import { NextResponse, type NextRequest } from "next/server";
import { routes } from "@/config/routes";
import type { AuthSession } from "@/features/auth/types/auth.types";
import { refreshSession } from "@/features/auth/server/refresh-session";
import {
  authCookieNames,
  getAccessCookieOptions,
  getExpiredCookieOptions,
  getRefreshCookieOptions,
} from "@/lib/auth/cookies";
import { shouldRefreshAccessToken } from "@/lib/auth/jwt";

const publicRoutes = new Set<string>([
  routes.login,
  routes.signup,
  routes.forgotPassword,
  routes.sellerActivation,
]);

const protectedRoutes = [
  routes.dashboard,
  routes.sales,
  routes.salesMatrix,
  routes.draws,
  routes.shifts,
  routes.numberControl,
  routes.blockedNumbers,
  routes.numberLimits,
  routes.results,
  routes.prizePayments,
  routes.cashCuts,
  routes.reports,
  routes.sellers,
  routes.users,
  routes.parameters,
  routes.audit,
  routes.settings,
];

type RequestSession = {
  authenticated: boolean;
  refreshedSession?: AuthSession;
  shouldClear?: boolean;
};

function isProtectedPath(pathname: string) {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

async function getRequestSession(request: NextRequest): Promise<RequestSession> {
  const accessToken = request.cookies.get(authCookieNames.access)?.value;
  const refreshToken = request.cookies.get(authCookieNames.refresh)?.value;

  if (accessToken && !shouldRefreshAccessToken(accessToken)) {
    return { authenticated: true };
  }

  if (!refreshToken) {
    return {
      authenticated: false,
      shouldClear: Boolean(accessToken),
    };
  }

  try {
    const session = await refreshSession(refreshToken);

    request.cookies.set(authCookieNames.access, session.accessToken);
    request.cookies.set(authCookieNames.refresh, session.refreshToken);

    return {
      authenticated: true,
      refreshedSession: session,
    };
  } catch {
    request.cookies.delete(authCookieNames.access);
    request.cookies.delete(authCookieNames.refresh);

    return {
      authenticated: false,
      shouldClear: true,
    };
  }
}

function syncSessionCookies(response: NextResponse, session: RequestSession) {
  if (session.refreshedSession) {
    response.cookies.set(
      authCookieNames.access,
      session.refreshedSession.accessToken,
      getAccessCookieOptions(session.refreshedSession.expiresIn),
    );
    response.cookies.set(
      authCookieNames.refresh,
      session.refreshedSession.refreshToken,
      getRefreshCookieOptions(),
    );
  }

  if (session.shouldClear) {
    response.cookies.set(authCookieNames.access, "", getExpiredCookieOptions());
    response.cookies.set(authCookieNames.refresh, "", getExpiredCookieOptions());
  }

  return response;
}

function getLoginUrl(request: NextRequest) {
  const loginUrl = new URL(routes.login, request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (nextPath !== routes.home) {
    loginUrl.searchParams.set("next", nextPath);
  }

  return loginUrl;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const mustResetInvalidSession =
    publicRoutes.has(pathname) &&
    request.nextUrl.searchParams.get("reauth") === "1";

  if (mustResetInvalidSession) {
    return syncSessionCookies(
      NextResponse.next({ request: { headers: request.headers } }),
      { authenticated: false, shouldClear: true },
    );
  }

  const requestSession = await getRequestSession(request);

  if (pathname === routes.home) {
    const destination = requestSession.authenticated
      ? routes.dashboard
      : routes.login;

    return syncSessionCookies(
      NextResponse.redirect(new URL(destination, request.url)),
      requestSession,
    );
  }

  if (publicRoutes.has(pathname) && requestSession.authenticated) {
    return syncSessionCookies(
      NextResponse.redirect(new URL(routes.dashboard, request.url)),
      requestSession,
    );
  }

  if (isProtectedPath(pathname) && !requestSession.authenticated) {
    return syncSessionCookies(
      NextResponse.redirect(getLoginUrl(request)),
      requestSession,
    );
  }

  return syncSessionCookies(
    NextResponse.next({ request: { headers: request.headers } }),
    requestSession,
  );
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
