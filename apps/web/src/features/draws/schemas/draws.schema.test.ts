import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createDrawShiftSchema,
  drawConfigurationSchema,
  drawConfigurationsQuerySchema,
  drawShiftsQuerySchema,
  updateDrawConfigurationSchema,
} from "./draws.schema";

describe("draw schemas", () => {
  it("normalizes every configuration field accepted by the API", () => {
    assert.deepEqual(
      drawConfigurationSchema.parse({
        code: "  NACIONAL_11.AM ",
        time: "11:00",
        tuesdayOnly: false,
        lockSecondsBefore: 60,
        reopenSecondsAfter: 600,
        active: true,
      }),
      {
        code: "nacional_11.am",
        time: "11:00",
        tuesdayOnly: false,
        lockSecondsBefore: 60,
        reopenSecondsAfter: 600,
        active: true,
      },
    );
  });

  it("rejects unsafe bounds and empty updates", () => {
    const invalid = drawConfigurationSchema.safeParse({
      code: "nacional 11",
      time: "25:00",
      tuesdayOnly: false,
      lockSecondsBefore: 3601,
      reopenSecondsAfter: 86401,
      active: true,
    });

    assert.equal(invalid.success, false);
    assert.equal(updateDrawConfigurationSchema.safeParse({}).success, false);
  });

  it("validates calendar dates and query contracts", () => {
    assert.equal(
      createDrawShiftSchema.safeParse({
        configurationId: "0d98b340-20f4-4edf-8891-4f35d94902bd",
        date: "2026-02-30",
      }).success,
      false,
    );
    assert.deepEqual(
      drawConfigurationsQuerySchema.parse({ active: "false" }),
      { page: 1, limit: 10, sortBy: "time", sortDirection: "asc", active: false },
    );
    assert.equal(drawShiftsQuerySchema.parse({ status: "ABIERTO" }).status, "ABIERTO");
  });
});
