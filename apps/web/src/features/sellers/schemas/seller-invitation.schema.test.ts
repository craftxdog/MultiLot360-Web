import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSellerInvitationSchema } from "./seller-invitation.schema";

describe("create seller invitation schema", () => {
  it("normalizes data before it reaches the API", () => {
    const result = createSellerInvitationSchema.parse({
      email: " SELLER@EXAMPLE.COM ",
      username: " Seller.One ",
      sellerName: " Seller One ",
      documentId: "001-010190-0001A",
      phone: "8888-8888",
      address: " Managua ",
      roleName: "VENDEDOR",
    });

    assert.deepEqual(result, {
      email: "seller@example.com",
      username: "seller.one",
      sellerName: "Seller One",
      documentId: "001-010190-0001A",
      phone: "+50588888888",
      address: "Managua",
      roleName: "VENDEDOR",
    });
  });

  it("rejects malformed identity data", () => {
    const result = createSellerInvitationSchema.safeParse({
      email: "not-an-email",
      username: "x",
      sellerName: "A",
      documentId: "123",
    });

    assert.equal(result.success, false);
  });
});
