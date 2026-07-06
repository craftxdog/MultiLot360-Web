import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeAuthMe } from "./auth.service";

describe("normalizeAuthMe", () => {
  it("converts the flattened API identity into the frontend user contract", () => {
    const result = normalizeAuthMe({
      user: {
        id: "user-1",
        authUserId: "auth-1",
        username: "admin",
        roleId: "role-1",
        roleName: "ADMIN",
        active: true,
        modules: ["ventas"],
        permissions: ["ventas.read"],
      },
    });

    assert.deepEqual(result.user.role, { id: "role-1", name: "ADMIN" });
    assert.deepEqual(result.user.modules, ["ventas"]);
    assert.deepEqual(result.user.permissions, ["ventas.read"]);
  });

  it("uses safe defaults for optional fields from auth/me", () => {
    const result = normalizeAuthMe({ user: { id: "user-1" } });

    assert.equal(result.user.username, "usuario");
    assert.equal(result.user.role.name, "Usuario");
    assert.deepEqual(result.user.permissions, []);
  });

  it("keeps the authenticated seller context on the user session", () => {
    const result = normalizeAuthMe({
      user: { id: "user-1", roleName: "VENDEDOR" },
      seller: { id: "seller-1", name: "Vendedor Uno", active: true },
    });

    assert.equal(result.user.seller?.id, "seller-1");
    assert.equal(result.user.seller?.name, "Vendedor Uno");
  });
});
