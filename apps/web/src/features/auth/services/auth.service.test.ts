import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { apiEndpoints } from "@/lib/api/endpoints";
import { authService, normalizeAuthMe } from "./auth.service";

const originalFetch = globalThis.fetch;

describe("normalizeAuthMe", () => {
  it("converts the flattened API identity into the frontend user contract", () => {
    const result = normalizeAuthMe({
      user: {
        id: "user-1",
        authUserId: "auth-1",
        username: "admin",
        roleId: "role-1",
        roleName: "ADMIN",
        active: true,
        modules: ["ventas"],
        permissions: ["ventas.read"],
      },
    });

    assert.deepEqual(result.user.role, { id: "role-1", name: "ADMIN" });
    assert.deepEqual(result.user.modules, ["ventas"]);
    assert.deepEqual(result.user.permissions, ["ventas.read"]);
  });

  it("uses safe defaults for optional fields from auth/me", () => {
    const result = normalizeAuthMe({ user: { id: "user-1" } });

    assert.equal(result.user.username, "usuario");
    assert.equal(result.user.role.name, "Usuario");
    assert.deepEqual(result.user.permissions, []);
  });

  it("keeps the authenticated seller context on the user session", () => {
    const result = normalizeAuthMe({
      user: { id: "user-1", roleName: "VENDEDOR" },
      seller: { id: "seller-1", name: "Vendedor Uno", active: true },
    });

    assert.equal(result.user.seller?.id, "seller-1");
    assert.equal(result.user.seller?.name, "Vendedor Uno");
  });
});

describe("authService password reset", () => {
  const requests: Array<{ url: string; method: string; body?: unknown; authorization?: string | null }> = [];

  beforeEach(() => {
    requests.length = 0;
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const headers = new Headers(init?.headers);

      requests.push({
        url: String(input),
        method: init?.method ?? "GET",
        body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
        authorization: headers.get("authorization"),
      });

      const data = String(input).includes(apiEndpoints.auth.requestPasswordReset)
        ? {
            accepted: true,
            message:
              "Si existe una cuenta elegible, enviaremos un código para restablecer la contraseña.",
          }
        : { passwordUpdated: true, sessionsRevoked: true };

      return new Response(JSON.stringify({ success: true, statusCode: 200, message: "ok", data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("uses the public API endpoints without bearer token", async () => {
    await authService.requestPasswordReset({ email: "cliente@example.com" });
    await authService.confirmPasswordReset({
      email: "cliente@example.com",
      code: "123456",
      newPassword: "NuevaClave2026!",
      confirmPassword: "NuevaClave2026!",
    });

    assert.deepEqual(
      requests.map(({ url, method, authorization }) => ({
        usesEndpoint: url.endsWith(apiEndpoints.auth.requestPasswordReset)
          ? apiEndpoints.auth.requestPasswordReset
          : url.endsWith(apiEndpoints.auth.confirmPasswordReset)
            ? apiEndpoints.auth.confirmPasswordReset
            : url,
        method,
        authorization,
      })),
      [
        {
          usesEndpoint: apiEndpoints.auth.requestPasswordReset,
          method: "POST",
          authorization: null,
        },
        {
          usesEndpoint: apiEndpoints.auth.confirmPasswordReset,
          method: "POST",
          authorization: null,
        },
      ],
    );
    assert.deepEqual(requests[0]?.body, { email: "cliente@example.com" });
    assert.deepEqual(requests[1]?.body, {
      email: "cliente@example.com",
      code: "123456",
      newPassword: "NuevaClave2026!",
      confirmPassword: "NuevaClave2026!",
    });
  });
});
