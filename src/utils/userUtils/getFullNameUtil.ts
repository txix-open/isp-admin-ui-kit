import { UserType } from '@type/user.type'

export const getUserFullName = (user: UserType): string =>
  user ? `${user.lastName} ${user.firstName}` : ''
