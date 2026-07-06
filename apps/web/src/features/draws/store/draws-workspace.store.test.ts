import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { useDrawsWorkspaceStore } from "./draws-workspace.store";

describe("draw workspace store", () => {
  beforeEach(() => {
    useDrawsWorkspaceStore.setState({
      configurationDrawerOpen: false,
      shiftDrawerOpen: false,
      selectedConfigurationId: null,
      pendingShiftAction: null,
    });
  });

  it("keeps only ephemeral interaction state", () => {
    const state = useDrawsWorkspaceStore.getState();
    state.openEditConfiguration("configuration-1");
    state.requestShiftAction({
      shiftId: "shift-1",
      configurationCode: "nacional-11am",
      status: "ABIERTO",
      action: "block",
    });

    assert.equal(useDrawsWorkspaceStore.getState().selectedConfigurationId, "configuration-1");
    assert.equal(useDrawsWorkspaceStore.getState().pendingShiftAction?.action, "block");

    useDrawsWorkspaceStore.getState().closeConfigurationDrawer();
    useDrawsWorkspaceStore.getState().clearShiftAction();
    assert.equal(useDrawsWorkspaceStore.getState().selectedConfigurationId, null);
    assert.equal(useDrawsWorkspaceStore.getState().pendingShiftAction, null);
  });
});
