import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildParametersQueryString,
  parseParametersQuery,
} from "./parameter-query";

describe("system parameter query", () => {
  it("parses safe filters and falls back for invalid pagination", () => {
    assert.deepEqual(
      parseParametersQuery(
        new URLSearchParams(
          "key=sales.&page=2&limit=50&sortBy=updatedAt&sortDirection=desc",
        ),
      ),
      {
        key: "sales.",
        page: 2,
        limit: 50,
        sortBy: "updatedAt",
        sortDirection: "desc",
      },
    );
    assert.deepEqual(parseParametersQuery(new URLSearchParams("page=-1")), {
      page: 1,
      limit: 20,
      sortBy: "key",
      sortDirection: "asc",
    });
  });

  it("serializes only active API parameters", () => {
    assert.equal(
      buildParametersQueryString({
        key: "sales.",
        page: 2,
        sortBy: "key",
        sortDirection: "asc",
      }),
      "?key=sales.&page=2&sortBy=key&sortDirection=asc",
    );
  });
});
