import { RoleType } from '@type/roles.type.ts'

export const findExclusiveRole = (
  roles: RoleType[],
  watchRoles: number[] = []
) => {
  let firstExclusiveElement = null
  for (let i = 0; i < roles.length; i++) {
    const item = roles[i]
    if (item.exclusive === true && watchRoles.includes(item.id)) {
      firstExclusiveElement = item
      break
    }
  }
  return firstExclusiveElement
}
