import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { parametersService } from "./parameters.service";

const originalFetch = globalThis.fetch;
const requests: Array<{ url: string; method: string; body?: string }> = [];

before(() => {
  globalThis.fetch = (async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    requests.push({
      url: String(input),
      method: init?.method ?? "GET",
      body: typeof init?.body === "string" ? init.body : undefined,
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
});

after(() => {
  globalThis.fetch = originalFetch;
});

describe("system parameters service endpoint coverage", () => {
  it("maps list, overview, detail and upsert to the protected BFF", async () => {
    requests.length = 0;
    const key = "sales.void_window_minutes";

    await parametersService.getParameters({ key: "sales.", page: 2 });
    await parametersService.getOverview();
    await parametersService.getParameter(key);
    await parametersService.upsertParameter({ key, value: "15" });

    assert.deepEqual(
      requests.map(({ url, method }) => ({ url, method })),
      [
        { url: "/api/parameters?key=sales.&page=2", method: "GET" },
        { url: "/api/parameters/overview", method: "GET" },
        { url: `/api/parameters/${key}`, method: "GET" },
        { url: `/api/parameters/${key}`, method: "PUT" },
      ],
    );
    assert.equal(JSON.parse(requests[3]?.body ?? "{}").value, "15");
  });
});
