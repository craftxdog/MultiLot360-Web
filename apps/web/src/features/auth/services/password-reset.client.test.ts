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

  it("confirms the code and password through the same-origin BFF", async () => {
    let body: unknown;
    globalThis.fetch = (async (_input, init) => {
      body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
      return Response.json({ passwordUpdated: true, sessionsRevoked: true });
    }) as typeof fetch;
    const formData = new FormData();
    formData.set("phase", "confirm");
    formData.set("email", "user@example.com");
    formData.set("code", "123456");
    formData.set("newPassword", "NuevaClave2026!");
    formData.set("confirmPassword", "NuevaClave2026!");

    const state = await submitPasswordReset(
      { phase: "confirm", email: "user@example.com" },
      formData,
    );

    assert.equal(state.phase, "done");
    assert.deepEqual(body, {
      phase: "confirm",
      email: "user@example.com",
      code: "123456",
      newPassword: "NuevaClave2026!",
      confirmPassword: "NuevaClave2026!",
    });
  });

  it("keeps an expired or invalid code in a generic recoverable state", async () => {
    globalThis.fetch = (async () => Response.json(
      { message: "Detalle interno que no debe mostrarse" },
      { status: 401 },
    )) as typeof fetch;
    const formData = new FormData();
    formData.set("phase", "confirm");
    formData.set("email", "user@example.com");
    formData.set("code", "123456");
    formData.set("newPassword", "NuevaClave2026!");
    formData.set("confirmPassword", "NuevaClave2026!");

    const state = await submitPasswordReset(
      { phase: "confirm", email: "user@example.com" },
      formData,
    );

    assert.equal(state.phase, "confirm");
    assert.equal(state.message, "El código es inválido o expiró. Solicita uno nuevo.");
    assert.doesNotMatch(state.message ?? "", /Detalle interno/);
  });

  it("confirms a secure link without putting its token in form fields", async () => {
    let body: unknown;
    globalThis.fetch = (async (_input, init) => {
      body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
      return Response.json({ passwordUpdated: true, sessionsRevoked: true });
    }) as typeof fetch;
    const tokenHash = "a".repeat(64);
    const formData = new FormData();
    formData.set("phase", "confirm-link");
    formData.set("newPassword", "NuevaClave2026!");
    formData.set("confirmPassword", "NuevaClave2026!");

    const state = await submitPasswordReset(
      { phase: "confirm-link", email: "user@example.com" },
      formData,
      tokenHash,
    );

    assert.equal(state.phase, "done");
    assert.deepEqual(body, {
      phase: "confirm-link",
      tokenHash,
      newPassword: "NuevaClave2026!",
      confirmPassword: "NuevaClave2026!",
    });
    assert.equal(formData.has("tokenHash"), false);
  });
});
