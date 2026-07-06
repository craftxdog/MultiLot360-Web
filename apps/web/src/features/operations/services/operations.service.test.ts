import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { operationsService } from "./operations.service";

const originalFetch = globalThis.fetch;
const requests: Array<{ url: string; method: string }> = [];

before(() => {
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(input), method: init?.method ?? "GET" });
    return new Response(JSON.stringify({ data: [], pagination: {} }), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
});

after(() => { globalThis.fetch = originalFetch; });

describe("operations service endpoint coverage", () => {
  it("maps every operational API endpoint to its protected BFF", async () => {
    requests.length = 0;
    const id = "0d98b340-20f4-4edf-8891-4f35d94902bd";
    await operationsService.results({ page: 2 });
    await operationsService.result(id);
    await operationsService.createResult({ shiftId: id, winningNumber: "02" });
    await operationsService.winningSales(id, { paid: false });
    await operationsService.prizes({ saleId: id });
    await operationsService.prize(id);
    await operationsService.payPrize({ resultId: id, saleId: id });
    await operationsService.cuts({ page: 2 });
    await operationsService.cut(id);
    await operationsService.createCut({ startDate: "2026-07-01", endDate: "2026-07-05" });
    await operationsService.cutSummary(id);
    await operationsService.report({ dateFrom: "2026-07-01", dateUntil: "2026-07-05" });
    await operationsService.analytics({ dateFrom: "2026-07-01", dateUntil: "2026-07-05", topLimit: 8 });
    await operationsService.sellerReports({ dateFrom: "2026-07-01", dateUntil: "2026-07-05" });
    await operationsService.audit({ userId: id });
    await operationsService.auditEvent(id);

    assert.deepEqual(requests, [
      { url: "/api/operations/results?page=2", method: "GET" },
      { url: `/api/operations/results/${id}`, method: "GET" },
      { url: "/api/operations/results", method: "POST" },
      { url: `/api/operations/results/${id}/winning-sales?paid=false`, method: "GET" },
      { url: `/api/operations/prizes?saleId=${id}`, method: "GET" },
      { url: `/api/operations/prizes/${id}`, method: "GET" },
      { url: "/api/operations/prizes", method: "POST" },
      { url: "/api/operations/cuts?page=2", method: "GET" },
      { url: `/api/operations/cuts/${id}`, method: "GET" },
      { url: "/api/operations/cuts", method: "POST" },
      { url: `/api/operations/cuts/${id}/summary`, method: "GET" },
      { url: "/api/operations/reports/overview?dateFrom=2026-07-01&dateUntil=2026-07-05", method: "GET" },
      { url: "/api/operations/reports/analytics?dateFrom=2026-07-01&dateUntil=2026-07-05&topLimit=8", method: "GET" },
      { url: "/api/operations/reports/sellers?dateFrom=2026-07-01&dateUntil=2026-07-05", method: "GET" },
      { url: `/api/operations/audit?userId=${id}`, method: "GET" },
      { url: `/api/operations/audit/${id}`, method: "GET" },
    ]);
  });
});
