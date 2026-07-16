import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatOperationDateTime } from "./operations-formatters";

describe("operations formatters", () => {
  it("formats timestamps consistently in Nicaragua", () => {
    assert.equal(
      formatOperationDateTime("2026-07-15T00:00:00.000Z"),
      "14 jul 2026, 6:00 p. m.",
    );
  });
});
