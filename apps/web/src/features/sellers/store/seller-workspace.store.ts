import { create } from "zustand";
import type { SellerInvitation } from "../types/seller.types";

type SellerWorkspaceState = {
  createDrawerOpen: boolean;
  selectedInvitation: SellerInvitation | null;
  invitationToRevoke: SellerInvitation | null;
  openCreateDrawer: () => void;
  closeCreateDrawer: () => void;
  selectInvitation: (invitation: SellerInvitation) => void;
  clearSelectedInvitation: () => void;
  requestRevoke: (invitation: SellerInvitation) => void;
  cancelRevoke: () => void;
};

export const useSellerWorkspaceStore = create<SellerWorkspaceState>((set) => ({
  createDrawerOpen: false,
  selectedInvitation: null,
  invitationToRevoke: null,
  openCreateDrawer: () => set({ createDrawerOpen: true }),
  closeCreateDrawer: () => set({ createDrawerOpen: false }),
  selectInvitation: (selectedInvitation) => set({ selectedInvitation }),
  clearSelectedInvitation: () => set({ selectedInvitation: null }),
  requestRevoke: (invitationToRevoke) => set({ invitationToRevoke }),
  cancelRevoke: () => set({ invitationToRevoke: null }),
}));
