import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { submitPasswordReset } from "./password-reset.client";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("password reset client", () => {
  it("uses the same-origin BFF and accepts its 202 anti-enumeration response", async () => {
    let request: { url?: string; body?: unknown } = {};
    globalThis.fetch = (async (input, init) => {
      request = {
        url: String(input),
        body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
      };
      return Response.json(
        { accepted: true, message: "Si existe una cuenta elegible, enviaremos un código." },
        { status: 202 },
      );
    }) as typeof fetch;

    const formData = new FormData();
    formData.set("phase", "request");
    formData.set("email", " USER@example.com ");
    const state = await submitPasswordReset({ phase: "request", email: "" }, formData);

    assert.equal(state.phase, "confirm");
    assert.deepEqual(request, {
      url: "/api/auth/password-reset",
      body: { phase: "request", email: "user@example.com" },
    });
  });

  it("keeps API failures inside a controlled error state", async () => {
    globalThis.fetch = (async () => Response.json(
      { message: "No pudimos procesar la solicitud." },
      { status: 503 },
    )) as typeof fetch;
    const formData = new FormData();
    formData.set("phase", "request");
    formData.set("email", "user@example.com");

    const state = await submitPasswordReset({ phase: "request", email: "" }, formData);

    assert.equal(state.phase, "request");
    assert.equal(state.message, "No pudimos procesar la solicitud.");
  });
});
