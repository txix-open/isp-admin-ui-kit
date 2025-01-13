import { useAuth } from 'isp-ui-kit'
import { useNavigate } from 'react-router-dom'

import { apiPaths } from '@constants/api/apiPaths.ts'
import { localStorageKeys } from '@constants/localStorageKeys.ts'

import { getConfigProperty } from '@utils/configUtils.ts'
import { LocalStorage } from '@utils/localStorageUtils.ts'

import { routePaths } from '@routes/routePaths.ts'

const useLogout = () => {
  const { logout, isLoading } = useAuth()
  const navigate = useNavigate()
  const headerName = LocalStorage.get(localStorageKeys.HEADER_NAME)

  const logoutUser = () =>
    logout(apiPaths.logout, {
      'X-APPLICATION-TOKEN': getConfigProperty(
        'APP_TOKEN',
        import.meta.env.VITE_APP_TOKEN
      ),
      [headerName]: LocalStorage.get(localStorageKeys.USER_TOKEN)
    })
      .then(() => {
        LocalStorage.remove(localStorageKeys.USER_TOKEN)
        LocalStorage.remove(localStorageKeys.HEADER_NAME)
        navigate(routePaths.login, { replace: true })
      })
      .catch(() => {})
  return { isLoading, logoutUser }
}

export default useLogout
