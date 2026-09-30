import { sessionStorageKeys } from '@constants/localStorageKeys'

import { routePaths } from '@routes/routePaths'

export const getLoginRedirectUrl = (): string => {
  const prevRoute = sessionStorage.getItem(sessionStorageKeys.PREV_ROUTE)
  sessionStorage.removeItem(sessionStorageKeys.PREV_ROUTE)
  const pathname = prevRoute?.split(/[?#]/)[0]

  return prevRoute &&
    prevRoute.startsWith('/') &&
    !prevRoute.startsWith('//') &&
    !prevRoute.includes('\\') &&
    ![routePaths.login, routePaths.error, routePaths.sudir].includes(
      pathname || ''
    )
    ? prevRoute
    : routePaths.home
}
