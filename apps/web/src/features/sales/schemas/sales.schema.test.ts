import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSaleSchema, salesVoidPolicySchema, voidSaleSchema } from "./sales.schema";

describe("sales schemas", () => {
  it("accepts a multi-number ticket within API bounds", () => {
    const result = createSaleSchema.parse({ shiftId: "6f66d473-f45e-4d7f-a9d7-3d024a8c0f01", items: [{ number: "02", prizeMiles: 10 }, { number: "99", prizeMiles: 40 }] });
    assert.equal(result.items.length, 2);
  });

  it("rejects malformed tickets and empty void reasons", () => {
    assert.equal(createSaleSchema.safeParse({ shiftId: "bad", items: [{ number: "2", prizeMiles: 0 }] }).success, false);
    assert.equal(voidSaleSchema.safeParse({ reason: "no" }).success, false);
  });

  it("accepts API monetary precision and rejects a third decimal", () => {
    const valid = createSaleSchema.safeParse({ shiftId: "6f66d473-f45e-4d7f-a9d7-3d024a8c0f01", items: [{ number: "02", prizeMiles: 0.5 }, { number: "15", prizeMiles: 1.4 }] });
    const invalid = createSaleSchema.safeParse({ shiftId: "6f66d473-f45e-4d7f-a9d7-3d024a8c0f01", items: [{ number: "02", prizeMiles: 0.001 }] });
    assert.equal(valid.success, true);
    assert.equal(invalid.success, false);
  });

  it("enforces the backend void policy bounds", () => {
    assert.equal(salesVoidPolicySchema.safeParse({ windowMinutes: 1 }).success, true);
    assert.equal(salesVoidPolicySchema.safeParse({ windowMinutes: 1441 }).success, false);
  });
});
