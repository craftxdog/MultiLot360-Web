import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { useNumberControlStore } from "./number-control.store";

describe("number control workspace store", () => {
  beforeEach(() => useNumberControlStore.setState({ limitDrawerOpen: false, blockDrawerOpen: false, selectedLimitId: null, selectedBlockId: null, pendingExpireLimitId: null, pendingDeleteBlockId: null }));

  it("keeps server data out of the ephemeral UI store", () => {
    useNumberControlStore.getState().openEditLimit("limit-1");
    useNumberControlStore.getState().requestDeleteBlock("block-1");
    assert.equal(useNumberControlStore.getState().selectedLimitId, "limit-1");
    assert.equal(useNumberControlStore.getState().pendingDeleteBlockId, "block-1");
    useNumberControlStore.getState().closeLimitDrawer();
    useNumberControlStore.getState().clearDeleteBlock();
    assert.equal(useNumberControlStore.getState().selectedLimitId, null);
    assert.equal(useNumberControlStore.getState().pendingDeleteBlockId, null);
  });
});
