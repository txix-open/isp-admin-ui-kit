import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { localStorageKeys } from '@constants/localStorageKeys'

import { LocalStorage } from '@utils/localStorageUtils'
import { getCleanPath } from '@utils/routeUtils'

import { routePaths } from '@routes/routePaths'

const PrivateRoute = () => {
  const location = useLocation()
  const userToken = LocalStorage.get(localStorageKeys.USER_TOKEN)

  if (!userToken) {
    const currentPathname = getCleanPath(location.pathname)
    const targetPath = `${currentPathname}${location.search}${location.hash}`
    sessionStorage.setItem('prevRoute', targetPath)
    return <Navigate to={routePaths.login} replace />
  }

  return <Outlet />
}

export default PrivateRoute
