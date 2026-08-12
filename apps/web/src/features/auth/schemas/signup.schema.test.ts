import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { signupSchema } from "./signup.schema";

const validSignup = {
  email: "owner@example.com",
  username: "owner.one",
  name: "Owner One",
  companyName: "Lotería Central, S.A.",
  companySlug: "loteria-central",
  priceId: "e110ca4d-3a0f-4001-a760-10d966eea6fc",
  paymentMethod: "BANK_TRANSFER",
  timezone: "America/Managua",
  password: "SafePassword2026!",
  confirmPassword: "SafePassword2026!",
};

describe("paid company signup schema", () => {
  it("accepts the exact paid tenant onboarding contract", () => {
    const parsed = signupSchema.parse(validSignup);
    assert.equal(parsed.companySlug, "loteria-central");
    assert.equal(parsed.paymentMethod, "BANK_TRANSFER");
  });

  it("rejects unsafe tenant slugs and mismatched passwords", () => {
    assert.equal(
      signupSchema.safeParse({ ...validSignup, companySlug: "Tenant With Spaces" }).success,
      false,
    );
    assert.equal(
      signupSchema.safeParse({ ...validSignup, confirmPassword: "Different2026!" }).success,
      false,
    );
  });
});
