import { create } from "zustand";

export type SaleDraftItem = { number: string; prizeMiles: number | null };

type SalesWorkspaceState = {
  items: SaleDraftItem[];
  selectedShiftId: string | null;
  selectedSellerId: string | null;
  selectedSaleId: string | null;
  pendingVoidSaleId: string | null;
  policyDrawerOpen: boolean;
  cartDrawerOpen: boolean;
  addItem: (item: SaleDraftItem) => void;
  addItems: (items: SaleDraftItem[]) => void;
  updateItem: (number: string, prizeMiles: number | null) => void;
  removeItem: (number: string) => void;
  clearDraft: () => void;
  selectShift: (id: string | null) => void;
  selectSeller: (id: string | null) => void;
  openSaleDetails: (id: string) => void;
  closeSaleDetails: () => void;
  requestVoid: (id: string) => void;
  clearVoid: () => void;
  openPolicy: () => void;
  closePolicy: () => void;
  openCart: () => void;
  closeCart: () => void;
};

function mergeItems(current: SaleDraftItem[], incoming: SaleDraftItem[]) {
  const merged = new Map(current.map((item) => [item.number, item]));

  for (const item of incoming) {
    const existing = merged.get(item.number);
    if (existing) {
      merged.set(item.number, {
        ...existing,
        prizeMiles:
          item.prizeMiles === null
            ? existing.prizeMiles
            : existing.prizeMiles === null
              ? item.prizeMiles
              : Math.min(999_999, existing.prizeMiles + item.prizeMiles),
      });
    } else if (merged.size < 100) {
      merged.set(item.number, item);
    }
  }

  return [...merged.values()];
}

export const useSalesWorkspaceStore = create<SalesWorkspaceState>((set) => ({
  items: [],
  selectedShiftId: null,
  selectedSellerId: null,
  selectedSaleId: null,
  pendingVoidSaleId: null,
  policyDrawerOpen: false,
  cartDrawerOpen: false,
  addItem: (item) => set((state) => ({ items: mergeItems(state.items, [item]) })),
  addItems: (items) => set((state) => ({ items: mergeItems(state.items, items) })),
  updateItem: (number, prizeMiles) => set((state) => ({ items: state.items.map((item) => item.number === number ? { ...item, prizeMiles } : item) })),
  removeItem: (number) => set((state) => ({ items: state.items.filter((item) => item.number !== number) })),
  clearDraft: () => set({ items: [] }),
  selectShift: (selectedShiftId) => set({ selectedShiftId }),
  selectSeller: (selectedSellerId) => set({ selectedSellerId }),
  openSaleDetails: (selectedSaleId) => set({ selectedSaleId }),
  closeSaleDetails: () => set({ selectedSaleId: null }),
  requestVoid: (pendingVoidSaleId) => set({ pendingVoidSaleId }),
  clearVoid: () => set({ pendingVoidSaleId: null }),
  openPolicy: () => set({ policyDrawerOpen: true }),
  closePolicy: () => set({ policyDrawerOpen: false }),
  openCart: () => set({ cartDrawerOpen: true }),
  closeCart: () => set({ cartDrawerOpen: false }),
}));
