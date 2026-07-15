import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { apiEndpoints } from "@/lib/api/endpoints";
import { POST } from "./route";

const originalFetch = globalThis.fetch;
const validToken = "A".repeat(43);

describe("POST /api/auth/seller-access/confirm", () => {
  const upstreamBodies: unknown[] = [];

  beforeEach(() => {
    upstreamBodies.length = 0;
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      assert.equal(String(input), `http://localhost:3000${apiEndpoints.auth.confirmSellerAccess}`);
      upstreamBodies.push(typeof init?.body === "string" ? JSON.parse(init.body) : undefined);
      return Response.json({
        success: true,
        statusCode: 200,
        message: "ok",
        data: { userId: "user-1", sellerId: "seller-1", email: "seller@example.com" },
      });
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("forwards only actionToken and password for secure invitations", async () => {
    const response = await POST(request({ actionToken: validToken, password: "NuevaClave2026!" }));

    assert.equal(response.status, 200);
    assert.deepEqual(upstreamBodies, [{ actionToken: validToken, password: "NuevaClave2026!" }]);
  });

  it("preserves the manual email, accessCode and password contract", async () => {
    const response = await POST(request({
      email: " SELLER@example.com ",
      accessCode: "123456",
      password: "NuevaClave2026!",
    }));

    assert.equal(response.status, 200);
    assert.deepEqual(upstreamBodies, [{
      email: "seller@example.com",
      accessCode: "123456",
      password: "NuevaClave2026!",
    }]);
  });

  it("rejects malformed tokens without contacting the API", async () => {
    const response = await POST(request({ actionToken: "not-valid", password: "NuevaClave2026!" }));

    assert.equal(response.status, 400);
    assert.equal(upstreamBodies.length, 0);
  });

  it("does not expose upstream details for expired or reused tokens", async () => {
    for (const status of [409, 410]) {
      globalThis.fetch = (async () => Response.json(
        { statusCode: status, message: `sensitive-${status}` },
        { status },
      )) as typeof fetch;

      const response = await POST(request({ actionToken: validToken, password: "NuevaClave2026!" }));
      const payload = await response.json() as { message: string };

      assert.equal(response.status, status);
      assert.match(payload.message, /código manual|nuevo enlace/);
      assert.doesNotMatch(payload.message, /sensitive/);
    }
  });
});

function request(body: unknown) {
  return new Request("https://app.test/api/auth/seller-access/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://app.test" },
    body: JSON.stringify(body),
  });
}
