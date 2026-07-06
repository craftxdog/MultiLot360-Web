import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildSalesWorkspaceHref, normalizeSaleNumber, parseSalesWorkspaceQuery } from "./sales-query";

describe("sales workspace query", () => {
  it("normalizes fast-entry numbers", () => {
    assert.equal(normalizeSaleNumber("7"), "07");
    assert.equal(normalizeSaleNumber("#42"), "42");
  });

  it("rejects unsafe filters and pagination", () => {
    const result = parseSalesWorkspaceQuery(new URLSearchParams("view=history&page=-5&number=7&status=BAD"), "sell");
    assert.equal(result.page, 1);
    assert.equal(result.number, undefined);
    assert.equal(result.status, undefined);
  });

  it("preserves history filters in pagination links", () => {
    assert.equal(buildSalesWorkspaceHref("/ventas", { view: "history", page: 1, limit: 10, status: "ACTIVA" }, { page: 2, number: "02" }), "/ventas?view=history&page=2&number=02&status=ACTIVA");
  });
});
