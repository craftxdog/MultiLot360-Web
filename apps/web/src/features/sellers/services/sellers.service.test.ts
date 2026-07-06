import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { sellersService } from "./sellers.service";

const originalFetch = globalThis.fetch;
const requests: Array<{ url: string; method: string; body?: string }> = [];

before(() => {
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(input), method: init?.method ?? "GET", body: typeof init?.body === "string" ? init.body : undefined });
    return new Response(JSON.stringify({ targetUser: { id: "user", username: "demo" } }), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;
});

after(() => { globalThis.fetch = originalFetch; });

describe("sellers service endpoint coverage", () => {
  it("maps invitations, access actions and administrative reset to the BFF", async () => {
    requests.length = 0;
    const id = "0d98b340-20f4-4edf-8891-4f35d94902bd";
    await sellersService.getDirectory({ active: true, page: 1 });
    await sellersService.getInvitations({ page: 2 });
    await sellersService.getOverview();
    await sellersService.createInvitation({ email: "seller@example.com", username: "seller", sellerName: "Seller", documentId: "001-010190-0001A" });
    await sellersService.resendAccessCode("seller@example.com");
    await sellersService.revokeInvitation(id);
    await sellersService.deactivateSeller({ sellerId: id, reason: "Baja administrativa" });
    await sellersService.deleteSeller({ sellerId: id, reason: "Eliminación completa" });
    await sellersService.adminResetPassword({ targetUserId: id, newPassword: "NuevaClave2026!", confirmPassword: "NuevaClave2026!" });

    assert.deepEqual(requests.map(({ url, method }) => ({ url, method })), [
      { url: "/api/sellers/directory?active=true&page=1", method: "GET" },
      { url: "/api/sellers/invitations?page=2", method: "GET" },
      { url: "/api/sellers/invitations/overview", method: "GET" },
      { url: "/api/sellers/invitations", method: "POST" },
      { url: "/api/sellers/access-code/resend", method: "POST" },
      { url: `/api/sellers/invitations/${id}/revoke`, method: "PATCH" },
      { url: `/api/sellers/${id}/deactivate`, method: "PATCH" },
      { url: `/api/sellers/${id}`, method: "DELETE" },
      { url: "/api/sellers/password-reset", method: "POST" },
    ]);
    assert.equal(JSON.parse(requests[6]?.body ?? "{}").reason, "Baja administrativa");
    assert.equal(JSON.parse(requests[7]?.body ?? "{}").reason, "Eliminación completa");
    assert.equal(JSON.parse(requests[8]?.body ?? "{}").targetUserId, id);
  });
});
