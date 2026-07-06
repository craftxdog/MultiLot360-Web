import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { navigationGroups, type NavigationItem } from "@/config/navigation";
import type { AuthUser } from "@/features/auth/types/auth.types";
import { canAccessItem } from "./permissions";

const user: AuthUser = {
  id: "user-1",
  authUserId: null,
  username: "operator",
  name: "Operator",
  active: true,
  role: { id: "role-1", name: "Operador" },
  modules: [],
  permissions: ["sorteos.read"],
};

const workspaceItem: NavigationItem = {
  title: "Turnos",
  href: "/turnos",
  icon: "calendar-clock",
  anyPermissions: ["turnos.read", "sorteos.read"],
};

describe("navigation permissions", () => {
  it("shows a unified workspace when any supported permission is present", () => {
    assert.equal(canAccessItem(user, workspaceItem), true);
    assert.equal(
      canAccessItem(
        { ...user, permissions: [] },
        workspaceItem,
      ),
      false,
    );
  });

  it("keeps a single primary navigation entry for the draws workspace", () => {
    const operationItems = navigationGroups.find(
      (group) => group.title === "Operación",
    )?.items;

    assert.equal(
      operationItems?.filter((item) => item.title === "Turnos").length,
      1,
    );
    assert.equal(
      operationItems?.some((item) => item.title === "Sorteos"),
      false,
    );
  });

  it("keeps one primary navigation entry for number controls", () => {
    const controlItems = navigationGroups.find(
      (group) => group.title === "Control",
    )?.items;

    assert.equal(
      controlItems?.filter((item) => item.title === "Control numérico").length,
      1,
    );
    assert.equal(controlItems?.some((item) => item.title === "Límites"), false);
    assert.equal(controlItems?.some((item) => item.title === "Bloqueados"), false);
  });
});
