import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { salesMatrixService } from "./sales-matrix.service";

const originalFetch = globalThis.fetch;
const requests: string[] = [];

before(() => {
  globalThis.fetch = (async (input: string | URL | Request) => {
    requests.push(String(input));
    return new Response(JSON.stringify({ rows: [] }), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
});

after(() => { globalThis.fetch = originalFetch; });

describe("sales matrix service endpoint coverage", () => {
  it("forwards every supported filter to the protected BFF", async () => {
    requests.length = 0;
    await salesMatrixService.get({ date: "2026-07-05", status: "TODAS", drawCode: "nacional", sellerId: "0d98b340-20f4-4edf-8891-4f35d94902bd" });
    assert.equal(requests[0], "/api/sales-matrix?date=2026-07-05&status=TODAS&drawCode=nacional&sellerId=0d98b340-20f4-4edf-8891-4f35d94902bd");
  });
});
