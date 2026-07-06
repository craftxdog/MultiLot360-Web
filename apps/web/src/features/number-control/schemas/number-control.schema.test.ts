import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBlockedNumbersSchema, createNumberLimitsSchema } from "./number-control.schema";

describe("number control schemas", () => {
  it("accepts a bulk limit with a valid date range", () => {
    const parsed = createNumberLimitsSchema.parse({ numbers: ["02", "99"], limitMiles: 250, validFrom: "2026-06-29", validUntil: "2026-06-30" });
    assert.deepEqual(parsed.numbers, ["02", "99"]);
  });

  it("rejects invalid numbers and reversed dates", () => {
    assert.equal(createNumberLimitsSchema.safeParse({ numbers: ["2"], limitMiles: 10, validFrom: "2026-07-01", validUntil: "2026-06-30" }).success, false);
  });

  it("requires exactly one block scope", () => {
    assert.equal(createBlockedNumbersSchema.safeParse({ numbers: ["02"], date: "2026-06-29" }).success, true);
    assert.equal(createBlockedNumbersSchema.safeParse({ numbers: ["02"] }).success, false);
    assert.equal(createBlockedNumbersSchema.safeParse({ numbers: ["02"], date: "2026-06-29", shiftId: "7c841d5a-ef52-4e41-94db-ca70eaa2e730" }).success, false);
  });
});
