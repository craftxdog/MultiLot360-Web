import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { auditQuerySchema, cutsQuerySchema, prizesQuerySchema, queryString, reportsQuerySchema, resultsQuerySchema } from "./operations-query";
describe("complete operational filters", () => {
  it("preserves every results filter and clamps pagination", () => {
    const parsed = resultsQuerySchema.parse({ page: "2", limit: "500", date: "2026-07-05", drawCode: "NACIONAL", winningNumber: "20" });
    assert.equal(parsed.page, 2);
    assert.equal(parsed.limit, 25);
    assert.equal(parsed.drawCode, "nacional");
    assert.equal(parsed.winningNumber, "20");
  });
  it("parses prize, cut, report and audit contracts", () => {
    assert.equal(prizesQuerySchema.parse({ paidFrom: "2026-07-01", paidUntil: "2026-07-05" }).paidFrom, "2026-07-01");
    assert.equal(cutsQuerySchema.parse({ visibleToSellers: "false" }).visibleToSellers, false);
    assert.equal(reportsQuerySchema.parse({ dateFrom: "2026-07-01", dateUntil: "2026-07-05" }).sortBy, "sellerName");
    assert.equal(auditQuerySchema.parse({ event: "sales.created" }).event, "sales.created");
  });
  it("serializes booleans and omits empty values", () => assert.equal(queryString({ active: false, page: 1, empty: undefined }), "?active=false&page=1"));
});
