import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parametersQuerySchema,
  upsertSystemParameterSchema,
} from "./parameter.schema";

describe("system parameter schemas", () => {
  it("normalizes a valid parameter and API query", () => {
    assert.deepEqual(
      upsertSystemParameterSchema.parse({
        key: " sales.void_window_minutes ",
        value: " 10 ",
      }),
      { key: "sales.void_window_minutes", value: "10" },
    );
    assert.deepEqual(
      parametersQuerySchema.parse({
        page: "2",
        limit: "50",
        sortBy: "updatedAt",
        sortDirection: "desc",
      }),
      {
        page: 2,
        limit: 50,
        sortBy: "updatedAt",
        sortDirection: "desc",
      },
    );
  });

  it("rejects unsafe keys and oversized values", () => {
    assert.equal(
      upsertSystemParameterSchema.safeParse({ key: "bad key", value: "1" })
        .success,
      false,
    );
    assert.equal(
      upsertSystemParameterSchema.safeParse({
        key: "valid.key",
        value: "x".repeat(2001),
      }).success,
      false,
    );
  });
});
