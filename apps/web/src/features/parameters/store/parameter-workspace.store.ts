import { create } from "zustand";
import type { SystemParameter } from "../types/parameter.types";

type ParameterDraft = Pick<SystemParameter, "key" | "value">;

type ParameterWorkspaceState = {
  editorOpen: boolean;
  selectedParameter: SystemParameter | null;
  draftParameter: ParameterDraft | null;
  openCreate: (draftParameter?: ParameterDraft | null) => void;
  openEdit: (parameter: SystemParameter) => void;
  closeEditor: () => void;
};

export const useParameterWorkspaceStore = create<ParameterWorkspaceState>(
  (set) => ({
    editorOpen: false,
    selectedParameter: null,
    draftParameter: null,
    openCreate: (draftParameter = null) =>
      set({ editorOpen: true, selectedParameter: null, draftParameter }),
    openEdit: (selectedParameter) =>
      set({ editorOpen: true, selectedParameter, draftParameter: null }),
    closeEditor: () =>
      set({ editorOpen: false, selectedParameter: null, draftParameter: null }),
  }),
);
