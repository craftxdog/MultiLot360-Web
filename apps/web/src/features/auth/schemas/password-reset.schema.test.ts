import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { adminResetPasswordSchema, confirmPasswordResetSchema, requestPasswordResetSchema } from "./password-reset.schema";
describe("password reset contracts", () => {
  it("normalizes request email without changing the generic server response contract", () => assert.deepEqual(requestPasswordResetSchema.parse({ email: " USER@Example.COM " }), { email: "user@example.com" }));
  it("requires six digits and matching passwords", () => {
    assert.equal(confirmPasswordResetSchema.safeParse({ email: "u@example.com", code: "12345", newPassword: "NuevaClave2026!", confirmPassword: "NuevaClave2026!" }).success, false);
    assert.equal(confirmPasswordResetSchema.safeParse({ email: "u@example.com", code: "123456", newPassword: "NuevaClave2026!", confirmPassword: "OtraClave2026!" }).success, false);
  });
  it("requires the internal user UUID for administrative resets", () => assert.equal(adminResetPasswordSchema.safeParse({ targetUserId: "seller-1", newPassword: "NuevaClave2026!", confirmPassword: "NuevaClave2026!" }).success, false));
});
