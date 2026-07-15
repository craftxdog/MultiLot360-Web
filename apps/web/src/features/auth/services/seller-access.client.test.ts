import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  initialSellerAccessState,
  submitSellerAccess,
} from "./seller-access.client";

const originalFetch = globalThis.fetch;
const validToken = "B".repeat(43);

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("seller access client", () => {
  it("sends only actionToken and password in token mode", async () => {
    let captured: { url?: string; body?: unknown } = {};
    globalThis.fetch = (async (input, init) => {
      captured = {
        url: String(input),
        body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
      };
      return Response.json({ userId: "u", sellerId: "s", email: "seller@example.com" });
    }) as typeof fetch;

    const formData = passwordForm();
    const state = await submitSellerAccess(validToken, initialSellerAccessState, formData);

    assert.equal(state.status, "success");
    assert.deepEqual(captured, {
      url: "/api/auth/seller-access/confirm",
      body: { actionToken: validToken, password: "NuevaClave2026!" },
    });
  });

  it("supports the manual contract", async () => {
    let body: unknown;
    globalThis.fetch = (async (_input, init) => {
      body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
      return Response.json({ userId: "u", sellerId: "s", email: "seller@example.com" });
    }) as typeof fetch;
    const formData = passwordForm();
    formData.set("email", "SELLER@example.com");
    formData.set("accessCode", "123456");

    const state = await submitSellerAccess(undefined, initialSellerAccessState, formData);

    assert.equal(state.status, "success");
    assert.deepEqual(body, {
      email: "seller@example.com",
      accessCode: "123456",
      password: "NuevaClave2026!",
    });
  });

  it("returns one generic error for expired and reused tokens without logging the token", async () => {
    const calls: unknown[][] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => calls.push(args);

    try {
      for (const status of [409, 410]) {
        globalThis.fetch = (async () => Response.json(
          { message: `internal-${status}` },
          { status },
        )) as typeof fetch;

        const state = await submitSellerAccess(validToken, initialSellerAccessState, passwordForm());
        assert.equal(state.status, "error");
        assert.match(state.message ?? "", /código manual|nuevo enlace/);
        assert.doesNotMatch(state.message ?? "", /internal/);
      }
    } finally {
      console.error = originalError;
    }

    assert.deepEqual(calls, []);
  });
});

function passwordForm() {
  const formData = new FormData();
  formData.set("password", "NuevaClave2026!");
  formData.set("confirmPassword", "NuevaClave2026!");
  return formData;
}
