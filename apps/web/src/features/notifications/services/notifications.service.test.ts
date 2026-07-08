import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { notificationsService } from "./notifications.service";

const originalFetch = globalThis.fetch;
const requests: Array<{ url: string; method: string }> = [];
before(() => { globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => { requests.push({ url: String(input), method: init?.method ?? "GET" }); return new Response(JSON.stringify({ data: [] }), { status: 200, headers: { "Content-Type": "application/json" } }); }) as typeof fetch; });
after(() => { globalThis.fetch = originalFetch; });

describe("notifications service endpoint coverage", () => {
  it("maps inbox, unread counter and read/delete mutations", async () => {
    requests.length = 0;
    const id = "0d98b340-20f4-4edf-8891-4f35d94902bd";
    await notificationsService.list({ unread: true, page: 1, limit: 25 }); await notificationsService.unreadCount(); await notificationsService.markRead(id); await notificationsService.markAllRead(); await notificationsService.delete(id);
    assert.deepEqual(requests, [{ url: "/api/notifications?unread=true&page=1&limit=25", method: "GET" }, { url: "/api/notifications/unread-count", method: "GET" }, { url: `/api/notifications/${id}/read`, method: "PATCH" }, { url: "/api/notifications/read-all", method: "PATCH" }, { url: `/api/notifications/${id}`, method: "DELETE" }]);
  });
});
