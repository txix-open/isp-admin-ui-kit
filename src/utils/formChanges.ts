import type { DeepPartial } from 'react-hook-form'

import type { RoleType } from '../type/roles.type'
import type { UserType } from '../type/user.type'

function haveSameSelection<T>(current: T[] = [], initial: T[] = []) {
  const initialItems = new Set(initial)
  return (
    current.length === initial.length &&
    current.every((item) => initialItems.has(item))
  )
}

type UserFormValues = DeepPartial<
  Pick<
    UserType,
    'firstName' | 'lastName' | 'email' | 'password' | 'description' | 'roles'
  >
>

export function hasUserChanges(
  current: UserFormValues,
  initial: UserFormValues
) {
  return (
    (current.firstName ?? '') !== (initial.firstName ?? '') ||
    (current.lastName ?? '') !== (initial.lastName ?? '') ||
    (current.email ?? '') !== (initial.email ?? '') ||
    (current.password ?? '') !== (initial.password ?? '') ||
    (current.description ?? '') !== (initial.description ?? '') ||
    !haveSameSelection(current.roles, initial.roles)
  )
}

type RoleFormValues = DeepPartial<
  Pick<RoleType, 'name' | 'externalGroup' | 'permissions'>
>

export function hasRoleChanges(
  current: RoleFormValues,
  initial: RoleFormValues
) {
  return (
    (current.name ?? '') !== (initial.name ?? '') ||
    (current.externalGroup ?? '') !== (initial.externalGroup ?? '') ||
    !haveSameSelection(current.permissions, initial.permissions)
  )
}
