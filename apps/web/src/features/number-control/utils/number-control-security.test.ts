import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isTrustedNumberControlOrigin } from "./number-control-security";

describe("number control mutation origin", () => {
  it("accepts only the exact application origin", () => {
    assert.equal(isTrustedNumberControlOrigin("https://app.multilot.test/api/number-control/limits", "https://app.multilot.test"), true);
    assert.equal(isTrustedNumberControlOrigin("https://app.multilot.test/api/number-control/limits", "https://evil.test"), false);
    assert.equal(isTrustedNumberControlOrigin("https://app.multilot.test/api/number-control/limits", null), false);
  });
});
