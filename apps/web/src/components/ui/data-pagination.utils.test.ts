import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPaginationHref,
  getPaginationPages,
  getPaginationSummary,
  normalizePagination,
} from "./data-pagination.utils";

describe("data pagination", () => {
  it("builds a compact range around the current page", () => {
    assert.deepEqual(getPaginationPages(1, 12), [1, 2, 12]);
    assert.deepEqual(getPaginationPages(6, 12), [1, 5, 6, 7, 12]);
    assert.deepEqual(getPaginationPages(12, 12), [1, 11, 12]);
  });

  it("preserves filters and omits page one from the URL", () => {
    const params = { status: "PENDIENTE", email: "ana@example.com", view: "list" };

    assert.equal(
      buildPaginationHref({ basePath: "/vendedores", params, page: 1 }),
      "/vendedores?status=PENDIENTE&email=ana%40example.com&view=list",
    );
    assert.equal(
      buildPaginationHref({ basePath: "/vendedores", params, page: 3 }),
      "/vendedores?status=PENDIENTE&email=ana%40example.com&view=list&page=3",
    );
  });

  it("calculates full, partial and empty page summaries", () => {
    const base = {
      limit: 10,
      totalPages: 3,
      hasNextPage: false,
      hasPreviousPage: true,
    };

    assert.deepEqual(getPaginationSummary({ ...base, page: 1, count: 10, total: 25 }), { from: 1, to: 10 });
    assert.deepEqual(getPaginationSummary({ ...base, page: 3, count: 5, total: 25 }), { from: 21, to: 25 });
    assert.deepEqual(getPaginationSummary({ ...base, page: 1, count: 0, total: 0 }), { from: 0, to: 0 });
  });

  it("clamps unsafe page metadata for navigation", () => {
    assert.deepEqual(
      normalizePagination({
        page: 99,
        limit: 10,
        count: 0,
        total: 12,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      }),
      { page: 2, totalPages: 2 },
    );
  });
});
