import { UserType } from '@type/user.type.ts'

export const getUserFullName = (user: UserType): string =>
  user ? `${user.lastName} ${user.firstName}` : ''
