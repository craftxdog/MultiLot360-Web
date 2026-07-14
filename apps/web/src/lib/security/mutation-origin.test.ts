import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isTrustedMutationOrigin } from "./mutation-origin";

describe("mutation origin validation", () => {
  it("accepts the public application origin behind a reverse proxy", () => {
    assert.equal(
      isTrustedMutationOrigin(
        "http://localhost:3000/api/parameters/draws.auto_generate_daily",
        "https://multilot360.alphaby.cloud",
        "https://multilot360.alphaby.cloud",
      ),
      true,
    );
  });

  it("rejects an origin outside the request and application origins", () => {
    assert.equal(
      isTrustedMutationOrigin(
        "http://localhost:3000/api/parameters/draws.auto_generate_daily",
        "https://evil.test",
        "https://multilot360.alphaby.cloud",
      ),
      false,
    );
  });

  it("rejects missing and malformed origins", () => {
    assert.equal(
      isTrustedMutationOrigin(
        "https://multilot360.alphaby.cloud/api/parameters/example",
        null,
      ),
      false,
    );
    assert.equal(
      isTrustedMutationOrigin(
        "https://multilot360.alphaby.cloud/api/parameters/example",
        "not-a-url",
      ),
      false,
    );
  });
});
