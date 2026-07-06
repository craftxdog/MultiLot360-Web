import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { accessControlService } from "./access-control.service";

const originalFetch = globalThis.fetch;
const requests: Array<{ url: string; method: string }> = [];
before(() => { globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => { requests.push({ url: String(input), method: init?.method ?? "GET" }); return new Response(JSON.stringify({ permissions: [] }), { status: 200, headers: { "Content-Type": "application/json" } }); }) as typeof fetch; });
after(() => { globalThis.fetch = originalFetch; });

describe("access-control service endpoint coverage", () => {
  it("maps all role and permission operations", async () => {
    const id = "0d98b340-20f4-4edf-8891-4f35d94902bd";
    await accessControlService.modules(); await accessControlService.roles(); await accessControlService.role(id); await accessControlService.createRole("Supervisor"); await accessControlService.replacePermissions({ roleId: id, permissions: [] }); await accessControlService.assignUserRole({ userId: id, roleId: id });
    assert.deepEqual(requests, [{ url: "/api/access/modules", method: "GET" }, { url: "/api/access/roles", method: "GET" }, { url: `/api/access/roles/${id}`, method: "GET" }, { url: "/api/access/roles", method: "POST" }, { url: `/api/access/roles/${id}/permissions`, method: "PUT" }, { url: `/api/access/users/${id}/role`, method: "PATCH" }]);
  });
});
