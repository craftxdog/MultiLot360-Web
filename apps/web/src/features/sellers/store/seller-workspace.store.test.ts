import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { useSellerWorkspaceStore } from "./seller-workspace.store";
import type { SellerInvitation } from "../types/seller.types";

const invitation: SellerInvitation = {
  id: "2d86d504-33d9-482d-ac98-c18a73425cfa",
  userId: "user-1",
  sellerId: "seller-1",
  email: "seller@example.com",
  username: "seller.one",
  sellerName: "Seller One",
  documentId: "001-010190-0001A",
  status: "PENDIENTE",
  expiresAt: "2026-06-28T12:00:00.000Z",
  usedAt: null,
  createdAt: "2026-06-28T11:00:00.000Z",
  createdBy: null,
};

describe("seller workspace store", () => {
  beforeEach(() => {
    useSellerWorkspaceStore.setState({
      createDrawerOpen: false,
      selectedInvitation: null,
      invitationToRevoke: null,
    });
  });

  it("keeps only ephemeral workspace state", () => {
    const actions = useSellerWorkspaceStore.getState();

    actions.openCreateDrawer();
    actions.selectInvitation(invitation);
    actions.requestRevoke(invitation);

    assert.deepEqual(
      {
        createDrawerOpen: useSellerWorkspaceStore.getState().createDrawerOpen,
        selectedInvitation: useSellerWorkspaceStore.getState().selectedInvitation,
        invitationToRevoke: useSellerWorkspaceStore.getState().invitationToRevoke,
      },
      {
      createDrawerOpen: true,
      selectedInvitation: invitation,
      invitationToRevoke: invitation,
      },
    );

    useSellerWorkspaceStore.getState().closeCreateDrawer();
    useSellerWorkspaceStore.getState().clearSelectedInvitation();
    useSellerWorkspaceStore.getState().cancelRevoke();

    assert.deepEqual(
      {
        createDrawerOpen: useSellerWorkspaceStore.getState().createDrawerOpen,
        selectedInvitation: useSellerWorkspaceStore.getState().selectedInvitation,
        invitationToRevoke: useSellerWorkspaceStore.getState().invitationToRevoke,
      },
      {
      createDrawerOpen: false,
      selectedInvitation: null,
      invitationToRevoke: null,
      },
    );
  });
});
