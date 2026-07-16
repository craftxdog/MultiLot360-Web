import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatSellerDate, getSellerInitials } from "./seller-formatters";

describe("seller formatters", () => {
  it("formats invitation dates in the business timezone", () => {
    assert.equal(
      formatSellerDate("2026-07-15T00:00:00.000Z"),
      "14 jul 2026, 6:00 p. m.",
    );
  });

  it("keeps empty dates and initials stable", () => {
    assert.equal(formatSellerDate(null), "—");
    assert.equal(getSellerInitials("  Aaron   Ulloa Silva "), "AU");
  });
});
