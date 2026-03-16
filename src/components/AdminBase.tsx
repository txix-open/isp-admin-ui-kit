import { ConfigProvider } from 'antd'
import ruRu from 'antd/locale/ru_RU'
import { FC, useEffect, useMemo, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { darkTheme, lightTheme } from '@constants/theme'

import { AdminBasePropsType } from '@components/admin-base.type'

import { getCleanPath } from '@utils/routeUtils'

import { Context } from '@stores/index'

import { getRoutesConfig } from '@routes/Routers'
import { routePaths } from '@routes/routePaths'

import './admin-base.scss'

const AdminBase: FC<AdminBasePropsType> = ({
  customRouters = [],
  defaultRoutePath,
  configProviderProps = {},
  excludePermissions = []
}) => {
  const [changeTheme, setChangeTheme] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    return saved ? JSON.parse(saved) : true
  })

  const baseUrl = import.meta.env.BASE_URL || '/'

  const routerConfig = useMemo(
    () =>
      createBrowserRouter(getRoutesConfig(customRouters, defaultRoutePath), {
        basename: baseUrl
      }),
    [customRouters, defaultRoutePath, baseUrl]
  )

  const theme = useMemo(
    () => (changeTheme ? darkTheme : lightTheme),
    [changeTheme]
  )

  useEffect(() => {
    return routerConfig.subscribe((state) => {
      const currentPathname = getCleanPath(state.location.pathname)
      const fullPath = `${currentPathname}${state.location.search}${state.location.hash}`
      const prevRoute = sessionStorage.getItem('prevRoute')

      if (
        currentPathname !== routePaths.error &&
        currentPathname !== routePaths.login &&
        currentPathname !== routePaths.home &&
        fullPath !== prevRoute
      ) {
        sessionStorage.setItem('prevRoute', fullPath)
      }
    })
  }, [routerConfig])

  return (
    <Context.Provider
      value={{
        changeTheme,
        setChangeTheme,
        excludePermissions
      }}
    >
      <ConfigProvider
        key={changeTheme ? 'dark' : 'light'}
        theme={theme}
        locale={ruRu}
        {...configProviderProps}
      >
        <RouterProvider router={routerConfig} />
      </ConfigProvider>
    </Context.Provider>
  )
}

export default AdminBase
