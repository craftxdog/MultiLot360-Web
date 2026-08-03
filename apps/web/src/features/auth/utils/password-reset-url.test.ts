import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cleanPasswordResetUrl,
  parsePasswordResetFragment,
  parsePasswordResetParams,
} from "./password-reset-url";

describe("password reset URL", () => {
  it("normalizes a valid recovery email", () => {
    assert.deepEqual(
      parsePasswordResetParams(new URLSearchParams({ email: " USER@Example.COM " })),
      { email: "user@example.com", validEmail: true },
    );
  });

  it("does not expose malformed URL input as an email", () => {
    assert.deepEqual(
      parsePasswordResetParams(new URLSearchParams({ email: "not-an-email" })),
      { email: "", validEmail: false },
    );
    assert.deepEqual(parsePasswordResetParams(new URLSearchParams()), {
      email: "",
      validEmail: false,
    });
  });

  it("reads only a valid recovery token from the URL fragment", () => {
    const tokenHash = "a".repeat(64);
    assert.equal(
      parsePasswordResetFragment(`#recovery_token=${tokenHash}`),
      tokenHash,
    );
    assert.equal(parsePasswordResetFragment("#recovery_token=short"), null);
    assert.equal(parsePasswordResetFragment(`#other=${tokenHash}`), null);
  });

  it("removes query parameters without navigation or reload", () => {
    const replacements: unknown[][] = [];
    cleanPasswordResetUrl(
      {
        state: { preserved: true },
        replaceState: (...args: unknown[]) => replacements.push(args),
      },
      { pathname: "/restablecer-contrasena" },
    );

    assert.deepEqual(replacements, [[
      { preserved: true },
      "",
      "/restablecer-contrasena",
    ]]);
  });
});
