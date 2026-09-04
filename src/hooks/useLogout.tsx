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
  const isOAuthLogin = LocalStorage.get(localStorageKeys.OAUTH_LOGIN)

  const clearAuthState = () => {
    LocalStorage.remove(localStorageKeys.USER_TOKEN)
    LocalStorage.remove(localStorageKeys.HEADER_NAME)
    sessionStorage.clear()
  }

  const logoutUser = () => {
    if (isOAuthLogin) {
      oAuthLogout(
        apiPaths.loginOAuth,
        {
          clientName: import.meta.env.VITE_CLIENT_NAME
        },
        {
          'Content-Type': 'application/json',
          'X-APPLICATION-TOKEN': getConfigProperty(
            'APP_TOKEN',
            import.meta.env.VITE_APP_TOKEN
          ),
          [headerName]: LocalStorage.get(localStorageKeys.USER_TOKEN)
        }
      )
        .then((data) => {
          LocalStorage.remove(localStorageKeys.OAUTH_LOGIN)
          clearAuthState()
          window.location.href = data.logoutUrl
        })
        .catch(() => {})
    } else {
      logout(apiPaths.logout, {
        'X-APPLICATION-TOKEN': getConfigProperty(
          'APP_TOKEN',
          import.meta.env.VITE_APP_TOKEN
        ),
        [headerName]: LocalStorage.get(localStorageKeys.USER_TOKEN)
      })
        .then(() => {
          clearAuthState()
          navigate(routePaths.login, { replace: true })
        })
        .catch(() => {})
    }
  }
  return { isLoading, logoutUser }
}

export default useLogout
