import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSellerMutationErrorMessage } from "./seller-mutation-messages";

describe("seller mutation messages", () => {
  it("does not expose invitation provider errors", () => {
    assert.equal(
      getSellerMutationErrorMessage("create-invitation"),
      "No se pudo enviar la invitación. Intenta nuevamente.",
    );
  });

  it("does not expose resend provider errors", () => {
    assert.equal(
      getSellerMutationErrorMessage("resend-access-code"),
      "No se pudo enviar el nuevo código. Intenta nuevamente.",
    );
  });
});
