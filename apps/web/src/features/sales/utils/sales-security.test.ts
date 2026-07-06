import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isTrustedSalesOrigin } from "./sales-security";

describe("sales mutation origin", () => {
  it("accepts only exact same-origin mutations", () => {
    assert.equal(isTrustedSalesOrigin("https://app.test/api/sales", "https://app.test"), true);
    assert.equal(isTrustedSalesOrigin("https://app.test/api/sales", "https://evil.test"), false);
    assert.equal(isTrustedSalesOrigin("https://app.test/api/sales", null), false);
  });
});
