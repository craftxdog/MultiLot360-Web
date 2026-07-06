import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAllowedDrawShiftActions } from "./draw-actions";

describe("draw shift actions", () => {
  it("exposes only valid transitions for each state", () => {
    assert.deepEqual(getAllowedDrawShiftActions("ABIERTO"), ["block", "close"]);
    assert.deepEqual(getAllowedDrawShiftActions("BLOQUEO"), ["reopen", "close"]);
    assert.deepEqual(getAllowedDrawShiftActions("CERRADO"), []);
  });
});
