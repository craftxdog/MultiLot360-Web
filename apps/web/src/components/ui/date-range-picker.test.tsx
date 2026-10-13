import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dateRangePickerPanelClass } from "./date-range-picker";

describe("DateRangePicker", () => {
  it("uses a viewport-bounded scrolling surface for its measured popover", () => {
    assert.match(dateRangePickerPanelClass, /fixed/);
    assert.match(dateRangePickerPanelClass, /overflow-y-auto/);
  });
});
