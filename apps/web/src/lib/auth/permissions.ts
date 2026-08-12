import type { NavigationGroup, NavigationItem } from "@/config/navigation";
import type { AuthUser } from "@/features/auth/types/auth.types";

export function canAccessItem(
  user: AuthUser,
  item: NavigationItem,
  context: { platformFinance?: boolean } = {},
) {
  if (item.platformOnly && !context.platformFinance) return false;
  if (item.ownerOnly && !user.tenant?.isOwner) return false;
  if (item.anyPermissions?.length) {
    return item.anyPermissions.some((permission) =>
      user.permissions.includes(permission),
    );
  }

  if (!item.permission) {
    return true;
  }

  return user.permissions.includes(item.permission);
}

export function filterNavigationByPermissions(
  user: AuthUser,
  groups: NavigationGroup[],
  context: { platformFinance?: boolean } = {},
) {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canAccessItem(user, item, context)),
    }))
    .filter((group) => group.items.length > 0);
}

export function filterItemsByPermissions(
  user: AuthUser,
  items: NavigationItem[],
) {
  return items.filter((item) => canAccessItem(user, item));
}

export function canAdminResetPassword(user: AuthUser) {
  return (
    user.role.name.toUpperCase() === "ADMIN" &&
    user.modules.some((moduleName) => moduleName.toUpperCase() === "USUARIOS") &&
    user.permissions.includes("usuarios.update")
  );
}
