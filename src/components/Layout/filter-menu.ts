import type { CustomMenuItemType } from './layout.type'

export const filterMenuByPermissions = (
  items: CustomMenuItemType[],
  hasPermission: (permission: string) => boolean
): CustomMenuItemType[] =>
  items.flatMap((item) => {
    const children = item.children
      ? filterMenuByPermissions(item.children, hasPermission)
      : undefined

    if (item.visibilityMode === 'children') {
      return children && children.length > 0 ? [{ ...item, children }] : []
    }

    const permissions = Array.isArray(item.permissions)
      ? item.permissions
      : [item.permissions]

    const isAlwaysVisible =
      typeof item.permissions === 'string' && item.permissions === 'ALWAYS_VIEW'
    const isVisible =
      isAlwaysVisible ||
      (permissions.length > 0 &&
        (item.permissionMode === 'all'
          ? permissions.every(hasPermission)
          : permissions.some(hasPermission)))

    return isVisible ? [{ ...item, ...(children ? { children } : {}) }] : []
  })
