import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSameOriginMutation } from "./draws-security";

describe("draw mutation origin", () => {
  it("accepts only the exact application origin", () => {
    assert.equal(
      isSameOriginMutation(
        "https://app.multilot.test/api/draws/shifts",
        "https://app.multilot.test",
      ),
      true,
    );
    assert.equal(
      isSameOriginMutation(
        "https://app.multilot.test/api/draws/shifts",
        "https://evil.test",
      ),
      false,
    );
    assert.equal(
      isSameOriginMutation("https://app.multilot.test/api/draws/shifts", null),
      false,
    );
  });
});
