"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSellerWorkspaceStore } from "../store/seller-workspace.store";

export function CreateSellerInvitationButton({ label = "Invitar vendedor" }: { label?: string }) {
  const openCreateDrawer = useSellerWorkspaceStore(
    (state) => state.openCreateDrawer,
  );

  return (
    <Button
      type="button"
      onClick={openCreateDrawer}
      className="h-9 gap-2 rounded-lg px-3 text-sm font-normal"
    >
      <Plus className="h-4 w-4" />
      {label}
    </Button>
  );
}
