import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isTrustedParameterOrigin } from "./parameter-security";

describe("system parameter mutation origin", () => {
  it("accepts only the exact application origin", () => {
    assert.equal(
      isTrustedParameterOrigin(
        "https://app.multilot.test/api/parameters/sales.value",
        "https://app.multilot.test",
      ),
      true,
    );
    assert.equal(
      isTrustedParameterOrigin(
        "https://app.multilot.test/api/parameters/sales.value",
        "https://evil.test",
      ),
      false,
    );
    assert.equal(
      isTrustedParameterOrigin(
        "https://app.multilot.test/api/parameters/sales.value",
        null,
      ),
      false,
    );
    assert.equal(
      isTrustedParameterOrigin(
        "http://localhost:8080/api/parameters/sales.value",
        "http://127.0.0.1:8080",
      ),
      true,
    );
    assert.equal(
      isTrustedParameterOrigin(
        "http://localhost:8080/api/parameters/sales.value",
        "http://127.0.0.1:9090",
      ),
      false,
    );
  });
});
