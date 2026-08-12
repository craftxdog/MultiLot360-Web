import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canSellWithOwnAccount, isTrustedSalesOrigin } from "./sales-security";

describe("sales mutation origin", () => {
  it("accepts only exact same-origin mutations", () => {
    assert.equal(isTrustedSalesOrigin("https://app.test/api/sales", "https://app.test"), true);
    assert.equal(isTrustedSalesOrigin("https://app.test/api/sales", "https://evil.test"), false);
    assert.equal(isTrustedSalesOrigin("https://app.test/api/sales", null), false);
  });
});

describe("sales account eligibility", () => {
  it("allows an admin to sell without a separate seller profile", () => {
    assert.equal(canSellWithOwnAccount(true), true);
  });

  it("still requires a seller profile for non-admin users", () => {
    assert.equal(canSellWithOwnAccount(false), false);
    assert.equal(canSellWithOwnAccount(false, "seller-id"), true);
  });
});
