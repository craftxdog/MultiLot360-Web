import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSellerQueryString, parseSellerInvitationsQuery } from "./seller-query";

describe("seller query", () => {
  it("normalizes supported filters and pagination", () => {
    const params = new URLSearchParams({
      email: " SELLER@EXAMPLE.COM ",
      sellerName: "  Ana Pérez  ",
      status: "pendiente",
      page: "3",
      limit: "25",
      sortDirection: "asc",
    });

    assert.deepEqual(parseSellerInvitationsQuery(params), {
      email: "seller@example.com",
      username: undefined,
      sellerName: "Ana Pérez",
      status: "PENDIENTE",
      page: 3,
      limit: 25,
      sortBy: undefined,
      sortDirection: "asc",
    });
  });

  it("rejects invalid state and clamps unsafe pagination", () => {
    const query = parseSellerInvitationsQuery(
      new URLSearchParams({
        email: "correo-invalido",
        status: "BORRADOR",
        page: "-1",
        limit: "500",
      }),
    );

    assert.equal(query.email, undefined);
    assert.equal(query.status, undefined);
    assert.equal(query.page, 1);
    assert.equal(query.limit, 100);
  });

  it("serializes only defined values", () => {
    assert.equal(
      buildSellerQueryString({
        sellerName: "Carlos",
        status: "USADO",
        page: 2,
        email: undefined,
      }),
      "?sellerName=Carlos&status=USADO&page=2",
    );
  });
});
