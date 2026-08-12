import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bankTransferSchema, reviewTransferSchema } from "./billing.schema";

describe("SaaS billing schemas", () => {
  it("accepts an exact bank transfer declaration", () => {
    const result = bankTransferSchema.parse({
      invoiceId: "a438c80e-ec4a-4f57-8a4f-f822aac99501",
      bankAccountId: "80130380-f708-4a3d-a705-3dd2050ff0be",
      amountMinor: 2900,
      currency: "USD",
      transferredAt: "2026-08-11T20:30:00.000Z",
      payerName: "Ana Pérez",
      sourceAccountLast4: "1234",
    });

    assert.equal(result.amountMinor, 2900);
    assert.equal(result.currency, "USD");
  });

  it("requires a reconciled bank reference before approval", () => {
    assert.equal(
      reviewTransferSchema.safeParse({ decision: "APROBADA" }).success,
      false,
    );
    assert.equal(
      reviewTransferSchema.safeParse({
        decision: "APROBADA",
        confirmedBankReference: "BANK-88421",
      }).success,
      true,
    );
  });
});
