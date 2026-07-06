import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { numberControlService } from "./number-control.service";

const originalFetch = globalThis.fetch;
const requests: Array<{ url: string; method: string }> = [];

before(() => {
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(input), method: init?.method ?? "GET" });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
});

after(() => { globalThis.fetch = originalFetch; });

describe("number control service endpoint coverage", () => {
  it("maps every limit and blocked-number operation to the protected BFF", async () => {
    requests.length = 0;
    const limitId = "0d98b340-20f4-4edf-8891-4f35d94902bd";
    const blockId = "2f7ec137-b4eb-4595-b93b-f1075d9f04bd";
    await numberControlService.getLimits({ page: 2, active: true });
    await numberControlService.createLimits({ numbers: ["02"], limitMiles: 100, validFrom: "2026-06-29" });
    await numberControlService.getLimit(limitId);
    await numberControlService.updateLimit(limitId, { limitMiles: 200 });
    await numberControlService.expireLimit(limitId, "2026-06-30");
    await numberControlService.getBlockedNumbers({ scope: "DATE" });
    await numberControlService.createBlockedNumbers({ numbers: ["15"], date: "2026-06-29" });
    await numberControlService.getBlockedNumber(blockId);
    await numberControlService.deleteBlockedNumber(blockId);
    await numberControlService.getOverview();

    assert.deepEqual(requests, [
      { url: "/api/number-control/limits?page=2&active=true", method: "GET" },
      { url: "/api/number-control/limits", method: "POST" },
      { url: `/api/number-control/limits/${limitId}`, method: "GET" },
      { url: `/api/number-control/limits/${limitId}`, method: "PATCH" },
      { url: `/api/number-control/limits/${limitId}/expire`, method: "PATCH" },
      { url: "/api/number-control/blocked?scope=DATE", method: "GET" },
      { url: "/api/number-control/blocked", method: "POST" },
      { url: `/api/number-control/blocked/${blockId}`, method: "GET" },
      { url: `/api/number-control/blocked/${blockId}`, method: "DELETE" },
      { url: "/api/number-control/overview", method: "GET" },
    ]);
  });
});
