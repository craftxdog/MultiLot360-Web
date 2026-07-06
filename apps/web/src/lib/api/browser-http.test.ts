import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { ApiError } from "@multilot/api-client";
import { browserHttp } from "./browser-http";

const originalFetch = globalThis.fetch;

after(() => {
  globalThis.fetch = originalFetch;
});

describe("browserHttp", () => {
  before(() => {
    globalThis.fetch = (async (_input, init) => {
      assert.equal(init?.credentials, "same-origin");
      assert.equal(init?.cache, "no-store");
      return new Response(null, { status: 204 });
    }) as typeof fetch;
  });

  it("sends protected BFF requests with same-origin credentials and supports 204", async () => {
    assert.equal(await browserHttp("/api/example"), undefined);
  });

  it("preserves validation message arrays", async () => {
    globalThis.fetch = (async () => new Response(JSON.stringify({ message: ["Campo inválido", "Revisa el valor"] }), { status: 400, headers: { "Content-Type": "application/json" } })) as typeof fetch;
    await assert.rejects(() => browserHttp("/api/example"), (error: unknown) => error instanceof ApiError && error.message === "Campo inválido, Revisa el valor");
  });
});
