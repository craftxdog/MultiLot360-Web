import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canResendSellerInvitation,
  getSellerInvitationResendLabel,
} from "./seller-invitation-actions";

describe("seller invitation actions", () => {
  it("allows resend and renewal while the seller account is inactive", () => {
    assert.equal(canResendSellerInvitation("PENDIENTE"), true);
    assert.equal(canResendSellerInvitation("EXPIRADO"), true);
    assert.equal(canResendSellerInvitation("REVOCADO"), true);
    assert.equal(canResendSellerInvitation("USADO"), false);
  });

  it("uses a clear renewal label for expired and revoked invitations", () => {
    assert.equal(getSellerInvitationResendLabel("PENDIENTE"), "Reenviar");
    assert.equal(getSellerInvitationResendLabel("EXPIRADO"), "Renovar");
    assert.equal(getSellerInvitationResendLabel("REVOCADO"), "Renovar");
  });
});
