import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { drawsService } from "./draws.service";

const originalFetch = globalThis.fetch;
const requests: Array<{ url: string; method: string; body?: string }> = [];

before(() => {
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
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

describe("draws service endpoint coverage", () => {
  it("maps every Draws API operation to its protected BFF endpoint", async () => {
    requests.length = 0;
    const configurationId = "0d98b340-20f4-4edf-8891-4f35d94902bd";
    const shiftId = "2f7ec137-b4eb-4595-b93b-f1075d9f04bd";

    await drawsService.getConfigurations({ page: 2, active: false });
    await drawsService.createConfiguration({
      code: "nacional-11am",
      time: "11:00:00",
      tuesdayOnly: false,
      autoGenerateShifts: true,
      lockSecondsBefore: 60,
      reopenSecondsAfter: 600,
      active: true,
    });
    await drawsService.getConfiguration(configurationId);
    await drawsService.updateConfiguration(configurationId, { active: false });
    await drawsService.getConfigurationDeleteImpact(configurationId);
    await drawsService.softDeleteConfiguration(configurationId, { reason: "Duplicado" });
    await drawsService.hardDeleteConfiguration(configurationId, { adminPassword: "secret", confirmation: "DELETE_DRAW_CONFIGURATION", reason: "Limpieza" });
    await drawsService.getActiveShifts({ date: "2026-06-29" });
    await drawsService.getShifts({ status: "BLOQUEO" });
    await drawsService.createShift({ configurationId, date: "2026-06-29" });
    await drawsService.autoGenerateShifts({ date: "2026-06-29" });
    await drawsService.blockShift(shiftId);
    await drawsService.reopenShift(shiftId);
    await drawsService.closeShift(shiftId);

    assert.deepEqual(
      requests.map(({ url, method }) => ({ url, method })),
      [
        { url: "/api/draws/configurations?page=2&active=false", method: "GET" },
        { url: "/api/draws/configurations", method: "POST" },
        { url: `/api/draws/configurations/${configurationId}`, method: "GET" },
        { url: `/api/draws/configurations/${configurationId}`, method: "PATCH" },
        { url: `/api/draws/configurations/${configurationId}/delete-impact`, method: "GET" },
        { url: `/api/draws/configurations/${configurationId}/soft-delete`, method: "PATCH" },
        { url: `/api/draws/configurations/${configurationId}`, method: "DELETE" },
        { url: "/api/draws/shifts/active?date=2026-06-29", method: "GET" },
        { url: "/api/draws/shifts?status=BLOQUEO", method: "GET" },
        { url: "/api/draws/shifts", method: "POST" },
        { url: "/api/draws/shifts/auto-generate", method: "POST" },
        { url: `/api/draws/shifts/${shiftId}/block`, method: "PATCH" },
        { url: `/api/draws/shifts/${shiftId}/reopen`, method: "PATCH" },
        { url: `/api/draws/shifts/${shiftId}/close`, method: "PATCH" },
      ],
    );
    assert.equal(JSON.parse(requests[1]?.body ?? "{}").code, "nacional-11am");
  });
});
