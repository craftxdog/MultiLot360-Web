import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { apiEndpoints } from "@/lib/api/endpoints";
import { POST } from "./route";

const originalFetch = globalThis.fetch;

describe("POST /api/auth/password-reset", () => {
  const upstreamRequests: Array<{ url: string; body: unknown }> = [];

  beforeEach(() => {
    upstreamRequests.length = 0;
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      upstreamRequests.push({
        url: String(input),
        body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
      });

      const data = String(input).endsWith(apiEndpoints.auth.requestPasswordReset)
        ? { accepted: true, message: "Solicitud aceptada." }
        : { passwordUpdated: true, sessionsRevoked: true };

      return Response.json({ success: true, statusCode: 200, message: "ok", data });
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("forwards a valid public request to the recovery API", async () => {
    const response = await POST(new Request("https://app.test/api/auth/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://app.test" },
      body: JSON.stringify({ phase: "request", email: " USER@example.com " }),
    }));

    assert.equal(response.status, 202);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(upstreamRequests, [{
      url: `http://localhost:3000${apiEndpoints.auth.requestPasswordReset}`,
      body: { email: "user@example.com" },
    }]);
  });

  it("forwards password confirmation through the same stable route", async () => {
    const response = await POST(new Request("https://app.test/api/auth/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://app.test" },
      body: JSON.stringify({
        phase: "confirm",
        email: "user@example.com",
        code: "123456",
        newPassword: "NuevaClave2026!",
        confirmPassword: "NuevaClave2026!",
      }),
    }));

    assert.equal(response.status, 200);
    assert.equal(upstreamRequests[0]?.url, `http://localhost:3000${apiEndpoints.auth.confirmPasswordReset}`);
  });

  it("rejects cross-origin mutations before contacting the API", async () => {
    const response = await POST(new Request("https://app.test/api/auth/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://evil.test" },
      body: JSON.stringify({ phase: "request", email: "user@example.com" }),
    }));

    assert.equal(response.status, 403);
    assert.equal(upstreamRequests.length, 0);
  });

  it("does not expose upstream recovery errors", async () => {
    globalThis.fetch = (async () => Response.json(
      { message: "internal account detail" },
      { status: 503 },
    )) as typeof fetch;

    const response = await POST(new Request("https://app.test/api/auth/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "https://app.test" },
      body: JSON.stringify({ phase: "request", email: "user@example.com" }),
    }));
    const payload = await response.json() as { message: string };

    assert.equal(response.status, 503);
    assert.doesNotMatch(payload.message, /internal|account detail/);
  });
});
