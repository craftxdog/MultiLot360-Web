import { create } from "zustand";

type NumberControlState = {
  limitDrawerOpen: boolean;
  blockDrawerOpen: boolean;
  selectedLimitId: string | null;
  selectedBlockId: string | null;
  pendingExpireLimitId: string | null;
  pendingDeleteBlockId: string | null;
  openCreateLimit: () => void;
  openEditLimit: (id: string) => void;
  closeLimitDrawer: () => void;
  openCreateBlock: () => void;
  openBlockDetails: (id: string) => void;
  closeBlockDrawer: () => void;
  requestExpireLimit: (id: string) => void;
  clearExpireLimit: () => void;
  requestDeleteBlock: (id: string) => void;
  clearDeleteBlock: () => void;
};

export const useNumberControlStore = create<NumberControlState>((set) => ({
  limitDrawerOpen: false,
  blockDrawerOpen: false,
  selectedLimitId: null,
  selectedBlockId: null,
  pendingExpireLimitId: null,
  pendingDeleteBlockId: null,
  openCreateLimit: () => set({ limitDrawerOpen: true, selectedLimitId: null }),
  openEditLimit: (selectedLimitId) => set({ limitDrawerOpen: true, selectedLimitId }),
  closeLimitDrawer: () => set({ limitDrawerOpen: false, selectedLimitId: null }),
  openCreateBlock: () => set({ blockDrawerOpen: true, selectedBlockId: null }),
  openBlockDetails: (selectedBlockId) => set({ blockDrawerOpen: true, selectedBlockId }),
  closeBlockDrawer: () => set({ blockDrawerOpen: false, selectedBlockId: null }),
  requestExpireLimit: (pendingExpireLimitId) => set({ pendingExpireLimitId }),
  clearExpireLimit: () => set({ pendingExpireLimitId: null }),
  requestDeleteBlock: (pendingDeleteBlockId) => set({ pendingDeleteBlockId }),
  clearDeleteBlock: () => set({ pendingDeleteBlockId: null }),
}));
