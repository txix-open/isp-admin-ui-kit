import type { UserType } from '../../type/user.type'

export type UserFilters = {
  search: string
  roleId?: number
  status: 'all' | 'active' | 'blocked'
}

export function readUserFilters(params: URLSearchParams): UserFilters {
  const role = params.get('role')
  const roleId = role && /^\d+$/.test(role) ? Number(role) : undefined
  const status = params.get('status')
  return {
    search: params.get('search') ?? '',
    roleId:
      roleId !== undefined && Number.isSafeInteger(roleId) && roleId >= 0
        ? roleId
        : undefined,
    status: status === 'active' || status === 'blocked' ? status : 'all'
  }
}

export function filterUsers(users: UserType[], filters: UserFilters) {
  const terms = filters.search
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  return users.filter((user) => {
    const text =
      `${user.id} ${user.firstName ?? ''} ${user.lastName ?? ''} ${user.email ?? ''}`.toLocaleLowerCase()
    const matchesSearch = terms.every((term) => text.includes(term))
    const matchesRole =
      filters.roleId === undefined || user.roles.includes(filters.roleId)
    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'blocked' ? user.blocked : !user.blocked)
    return matchesSearch && matchesRole && matchesStatus
  })
}

export function getUsersPage(
  params: URLSearchParams,
  total: number,
  pageSize: number
) {
  const requestedPage = Number(params.get('page') ?? '1')
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  return Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, lastPage)
    : 1
}
