import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cleanSellerActivationUrl,
  parseSellerActivationParams,
} from "./seller-activation-url";

describe("seller activation URL", () => {
  it("accepts exactly 43 URL-safe token characters", () => {
    const token = `${"a".repeat(40)}_-9`;
    assert.deepEqual(
      parseSellerActivationParams(new URLSearchParams({ token })),
      { actionToken: token, invalidToken: false },
    );
  });

  it("marks malformed tokens invalid without exposing them as actionToken", () => {
    assert.deepEqual(
      parseSellerActivationParams(new URLSearchParams({ token: "invalid.token" })),
      { invalidToken: true },
    );
  });

  it("normalizes legacy email and code for readonly prefill", () => {
    assert.deepEqual(
      parseSellerActivationParams(new URLSearchParams({
        email: "  SELLER@EXAMPLE.COM ",
        code: "12-34 56",
      })),
      {
        invalidToken: false,
        initialEmail: "seller@example.com",
        initialAccessCode: "123456",
      },
    );
  });

  it("cleans query parameters with replaceState instead of navigation", () => {
    const replacements: unknown[][] = [];
    cleanSellerActivationUrl(
      { state: { preserved: true }, replaceState: (...args: unknown[]) => replacements.push(args) },
      { pathname: "/activar-vendedor" },
    );

    assert.deepEqual(replacements, [[{ preserved: true }, "", "/activar-vendedor"]]);
  });
});
