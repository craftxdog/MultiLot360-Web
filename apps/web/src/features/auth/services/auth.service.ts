import { apiEndpoints } from "@/lib/api/endpoints";
import { http } from "@/lib/api/http";
import type {
  AuthMeApiResponse,
  AuthMeResponse,
  AuthSession,
  ConfirmSellerAccessPayload,
  ConfirmSellerAccessResponse,
  ConfirmPasswordResetPayload,
  ConfirmPasswordResetResponse,
  LoginPayload,
  LogoutResponse,
  RefreshSessionPayload,
  RequestPasswordResetPayload,
  RequestPasswordResetResponse,
  SignupPayload,
} from "../types/auth.types";

export function normalizeAuthMe(payload: AuthMeApiResponse): AuthMeResponse {
  const { user } = payload;

  return {
    user: {
      id: user.id,
      authUserId: user.authUserId ?? null,
      username: user.username ?? "usuario",
      name: null,
      active: user.active ?? true,
      role: {
        id: user.roleId ?? "unknown",
        name: user.roleName ?? "Usuario",
      },
      modules: user.modules ?? [],
      permissions: user.permissions ?? [],
      ...(payload.seller ? { seller: payload.seller } : {}),
    },
    ...(payload.seller ? { seller: payload.seller } : {}),
  };
}

export const authService = {
  login(payload: LoginPayload) {
    return http<AuthSession>(apiEndpoints.auth.login, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  signup(payload: SignupPayload) {
    return http<AuthSession>(apiEndpoints.auth.signup, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  refresh(payload: RefreshSessionPayload) {
    return http<AuthSession>(apiEndpoints.auth.refresh, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async me(accessToken: string) {
    const payload = await http<AuthMeApiResponse>(apiEndpoints.auth.me, {
      method: "GET",
      token: accessToken,
    });

    return normalizeAuthMe(payload);
  },

  logout(accessToken: string) {
    return http<LogoutResponse>(apiEndpoints.auth.logout, {
      method: "POST",
      token: accessToken,
    });
  },

  confirmSellerAccess(payload: ConfirmSellerAccessPayload) {
    return http<ConfirmSellerAccessResponse>(
      apiEndpoints.auth.confirmSellerAccess,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );
  },

  requestPasswordReset(payload: RequestPasswordResetPayload) {
    return http<RequestPasswordResetResponse>(
      apiEndpoints.auth.requestPasswordReset,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },

  confirmPasswordReset(payload: ConfirmPasswordResetPayload) {
    return http<ConfirmPasswordResetResponse>(
      apiEndpoints.auth.confirmPasswordReset,
      { method: "POST", body: JSON.stringify(payload) },
    );
  },
};
