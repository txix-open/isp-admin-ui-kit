type LocalStorageKeys = 'HEADER_NAME' | 'USER_TOKEN' | 'OAUTH_LOGIN'
type SessionStorageKeys = 'PREV_ROUTE'

const baseSegments = (import.meta.env.BASE_URL || '/')
  .split('/')
  .filter(Boolean)
  .map((segment: string) => segment.toUpperCase())

const keyPrefix = baseSegments.length > 0 ? `${baseSegments.join('_')}_` : ''

export const localStorageKeys: Record<LocalStorageKeys, string> = {
  HEADER_NAME: `${keyPrefix}HEADER_NAME`,
  USER_TOKEN: `${keyPrefix}USER_TOKEN`,
  OAUTH_LOGIN: `${keyPrefix}OAUTH_LOGIN`
}

export const sessionStorageKeys: Record<SessionStorageKeys, string> = {
  PREV_ROUTE: `${keyPrefix}prevRoute`
}
