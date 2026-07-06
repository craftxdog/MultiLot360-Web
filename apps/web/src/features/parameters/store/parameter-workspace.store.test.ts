import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { useParameterWorkspaceStore } from "./parameter-workspace.store";

describe("system parameter workspace store", () => {
  beforeEach(() => {
    useParameterWorkspaceStore.setState({
      editorOpen: false,
      selectedParameter: null,
    });
  });

  it("keeps only ephemeral editor state", () => {
    const parameter = {
      key: "sales.void_window_minutes",
      value: "10",
      updatedAt: "2026-07-01T12:00:00.000Z",
    };

    useParameterWorkspaceStore.getState().openEdit(parameter);
    assert.equal(
      useParameterWorkspaceStore.getState().selectedParameter?.key,
      parameter.key,
    );
    useParameterWorkspaceStore.getState().closeEditor();
    assert.equal(useParameterWorkspaceStore.getState().selectedParameter, null);
    assert.equal(useParameterWorkspaceStore.getState().editorOpen, false);
  });
});
