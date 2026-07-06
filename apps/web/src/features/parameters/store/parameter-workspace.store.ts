import { create } from "zustand";
import type { SystemParameter } from "../types/parameter.types";

type ParameterWorkspaceState = {
  editorOpen: boolean;
  selectedParameter: SystemParameter | null;
  openCreate: () => void;
  openEdit: (parameter: SystemParameter) => void;
  closeEditor: () => void;
};

export const useParameterWorkspaceStore = create<ParameterWorkspaceState>(
  (set) => ({
    editorOpen: false,
    selectedParameter: null,
    openCreate: () => set({ editorOpen: true, selectedParameter: null }),
    openEdit: (selectedParameter) => set({ editorOpen: true, selectedParameter }),
    closeEditor: () => set({ editorOpen: false, selectedParameter: null }),
  }),
);
