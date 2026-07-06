import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getJwtExpiration, shouldRefreshAccessToken } from "./jwt";

function createUnsignedToken(payload: object) {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  return `${encode({ alg: "none" })}.${encode(payload)}.`;
}

describe("JWT session helpers", () => {
  it("reads the token expiration", () => {
    assert.equal(getJwtExpiration(createUnsignedToken({ exp: 2_000 })), 2_000);
  });

  it("refreshes tokens inside the safety window", () => {
    const token = createUnsignedToken({ exp: 1_050 });

    assert.equal(shouldRefreshAccessToken(token, 1_000, 60), true);
  });

  it("keeps a healthy token without an API roundtrip", () => {
    const token = createUnsignedToken({ exp: 1_500 });

    assert.equal(shouldRefreshAccessToken(token, 1_000, 60), false);
  });

  it("treats malformed tokens as refresh candidates", () => {
    assert.equal(shouldRefreshAccessToken("not-a-jwt", 1_000, 60), true);
  });
});
