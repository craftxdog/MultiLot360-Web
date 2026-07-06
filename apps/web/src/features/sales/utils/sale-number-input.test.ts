import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { consumeSaleDigitPairs, fitSaleNumbersToTicket, sanitizeSaleDigits } from "./sale-number-input";

describe("sale number numeric input", () => {
  it("keeps only digits for the mobile numeric flow", () => {
    assert.equal(sanitizeSaleDigits("0a2,15"), "0215");
  });

  it("fixes every complete pair without separators", () => {
    assert.deepEqual(consumeSaleDigitPairs("021532"), {
      numbers: ["02", "15", "32"],
      remainder: "",
    });
  });

  it("leaves an incomplete last digit in the input", () => {
    assert.deepEqual(consumeSaleDigitPairs("02153"), {
      numbers: ["02", "15"],
      remainder: "3",
    });
  });

  it("reports numbers that exceed the ticket capacity without rejecting duplicates", () => {
    assert.deepEqual(fitSaleNumbersToTicket(["02", "15"], ["15", "32", "44"], 3), {
      accepted: ["15", "32"],
      overflow: ["44"],
    });
  });
});
