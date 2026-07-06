import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { salesService } from "./sales.service";

const originalFetch = globalThis.fetch;
const requests: Array<{ url: string; method: string }> = [];

before(() => {
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(input), method: init?.method ?? "GET" });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
});
after(() => { globalThis.fetch = originalFetch; });

describe("sales service endpoint coverage", () => {
  it("maps every Sales API operation to the protected BFF", async () => {
    requests.length = 0;
    const saleId = "0d98b340-20f4-4edf-8891-4f35d94902bd";
    await salesService.getSales({ page: 2, status: "ACTIVA" });
    await salesService.createSale({ shiftId: saleId, items: [{ number: "02", prizeMiles: 10 }] });
    await salesService.getSale(saleId);
    await salesService.voidSale(saleId, "Cliente solicitó anulación");
    await salesService.getVoidPolicy();
    await salesService.updateVoidPolicy(15);
    await salesService.getOverview();
    assert.deepEqual(requests, [
      { url: "/api/sales?page=2&status=ACTIVA", method: "GET" },
      { url: "/api/sales", method: "POST" },
      { url: `/api/sales/${saleId}`, method: "GET" },
      { url: `/api/sales/${saleId}/void`, method: "PATCH" },
      { url: "/api/sales/settings/void-policy", method: "GET" },
      { url: "/api/sales/settings/void-policy", method: "PATCH" },
      { url: "/api/sales/overview", method: "GET" },
    ]);
  });
});
