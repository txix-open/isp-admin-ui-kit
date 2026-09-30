import { useAuth } from 'isp-ui-kit'
import { useNavigate } from 'react-router-dom'

import { apiPaths } from '@constants/api/apiPaths'
import { localStorageKeys } from '@constants/localStorageKeys'

import { getConfigProperty } from '@utils/configUtils'
import { LocalStorage } from '@utils/localStorageUtils'

import { routePaths } from '@routes/routePaths'

const useLogout = () => {
  const { logout, isLoading, oAuthLogout } = useAuth()
  const navigate = useNavigate()
  const headerName = LocalStorage.get(localStorageKeys.HEADER_NAME)
  const userToken = LocalStorage.get(localStorageKeys.USER_TOKEN)
  const isOAuthLogin = LocalStorage.get(localStorageKeys.OAUTH_LOGIN)
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-APPLICATION-TOKEN': getConfigProperty(
      'APP_TOKEN',
      import.meta.env.VITE_APP_TOKEN
    )
  }
  if (headerName && userToken) {
    baseHeaders[headerName] = userToken
  }

  const getOAuthLogoutUrl = async (): Promise<string | undefined> => {
    if (!isOAuthLogin) return undefined
    const response = await oAuthLogout(
      apiPaths.loginOAuth,
      {
        clientName: getConfigProperty(
          'CLIENT_NAME',
          import.meta.env.VITE_CLIENT_NAME
        )
      },
      baseHeaders
    )
    if (!response.logoutUrl) throw new Error('Missing OAuth logout URL')
    return response.logoutUrl
  }

  const cleanupAndRedirect = (logoutUrl?: string) => {
    LocalStorage.remove(localStorageKeys.USER_TOKEN)
    LocalStorage.remove(localStorageKeys.HEADER_NAME)
    LocalStorage.remove(localStorageKeys.OAUTH_LOGIN)
    sessionStorage.clear()

    if (logoutUrl) {
      window.location.href = logoutUrl
    } else {
      navigate(routePaths.login, { replace: true })
    }
  }

  const logoutUser = async (): Promise<void> => {
    const logoutUrl = await getOAuthLogoutUrl()
    await logout(apiPaths.logout, baseHeaders)
    cleanupAndRedirect(logoutUrl)
  }

  return { isLoading, logoutUser }
}

export default useLogout
