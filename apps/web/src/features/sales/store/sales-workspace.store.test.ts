import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { useSalesWorkspaceStore } from "./sales-workspace.store";

describe("sales workspace store", () => {
  beforeEach(() => useSalesWorkspaceStore.setState({ items: [], selectedShiftId: null, selectedSellerId: null, selectedSaleId: null, pendingVoidSaleId: null, policyDrawerOpen: false, cartDrawerOpen: false }));

  it("merges duplicate numbers exactly like the API use case", () => {
    useSalesWorkspaceStore.getState().addItem({ number: "02", prizeMiles: 10 });
    useSalesWorkspaceStore.getState().addItem({ number: "02", prizeMiles: 15 });
    assert.deepEqual(useSalesWorkspaceStore.getState().items, [{ number: "02", prizeMiles: 25 }]);
  });

  it("adds a complete batch in one store update and merges repeated numbers", () => {
    useSalesWorkspaceStore.getState().addItem({ number: "02", prizeMiles: 5 });
    useSalesWorkspaceStore.getState().addItems([
      { number: "02", prizeMiles: 10 },
      { number: "15", prizeMiles: 10 },
      { number: "32", prizeMiles: 10 },
    ]);
    assert.deepEqual(useSalesWorkspaceStore.getState().items, [
      { number: "02", prizeMiles: 15 },
      { number: "15", prizeMiles: 10 },
      { number: "32", prizeMiles: 10 },
    ]);
  });

  it("keeps variable-amount numbers pending until the seller completes them", () => {
    useSalesWorkspaceStore.getState().addItem({ number: "45", prizeMiles: null });
    assert.deepEqual(useSalesWorkspaceStore.getState().items, [{ number: "45", prizeMiles: null }]);

    useSalesWorkspaceStore.getState().updateItem("45", 20);
    assert.deepEqual(useSalesWorkspaceStore.getState().items, [{ number: "45", prizeMiles: 20 }]);
  });

  it("keeps only draft and ephemeral interaction state", () => {
    useSalesWorkspaceStore.getState().selectShift("shift-1");
    useSalesWorkspaceStore.getState().openSaleDetails("sale-1");
    assert.equal(useSalesWorkspaceStore.getState().selectedShiftId, "shift-1");
    assert.equal(useSalesWorkspaceStore.getState().selectedSaleId, "sale-1");
  });
});
