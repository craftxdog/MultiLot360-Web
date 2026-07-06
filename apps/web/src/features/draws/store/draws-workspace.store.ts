import { create } from "zustand";
import type { DrawShiftAction, DrawShiftStatus } from "../types/draws.types";

type PendingShiftAction = {
  shiftId: string;
  configurationCode: string;
  status: DrawShiftStatus;
  action: DrawShiftAction;
};

type DrawsWorkspaceState = {
  configurationDrawerOpen: boolean;
  shiftDrawerOpen: boolean;
  selectedConfigurationId: string | null;
  pendingShiftAction: PendingShiftAction | null;
  openCreateConfiguration: () => void;
  openEditConfiguration: (configurationId: string) => void;
  closeConfigurationDrawer: () => void;
  openShiftDrawer: () => void;
  closeShiftDrawer: () => void;
  requestShiftAction: (action: PendingShiftAction) => void;
  clearShiftAction: () => void;
};

export const useDrawsWorkspaceStore = create<DrawsWorkspaceState>((set) => ({
  configurationDrawerOpen: false,
  shiftDrawerOpen: false,
  selectedConfigurationId: null,
  pendingShiftAction: null,
  openCreateConfiguration: () =>
    set({ configurationDrawerOpen: true, selectedConfigurationId: null }),
  openEditConfiguration: (selectedConfigurationId) =>
    set({ configurationDrawerOpen: true, selectedConfigurationId }),
  closeConfigurationDrawer: () =>
    set({ configurationDrawerOpen: false, selectedConfigurationId: null }),
  openShiftDrawer: () => set({ shiftDrawerOpen: true }),
  closeShiftDrawer: () => set({ shiftDrawerOpen: false }),
  requestShiftAction: (pendingShiftAction) => set({ pendingShiftAction }),
  clearShiftAction: () => set({ pendingShiftAction: null }),
}));
