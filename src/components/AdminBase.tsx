import { ConfigProvider } from 'antd'
import ruRu from 'antd/locale/ru_RU'
import { FC, useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { darkTheme, lightTheme } from '@constants/theme.ts'

import { AdminBasePropsType } from '@components/admin-base.type.ts'

import { Context } from '@stores/index'

import { getRoutesConfig } from '@routes/Routers'
import { routePaths } from '@routes/routePaths.ts'

import './admin-base.scss'

const AdminBase: FC<AdminBasePropsType> = ({
  customRouters = [],
  defaultRoutePath,
  configProviderProps = {}
}) => {
  const [themes, setTheme] = useState(lightTheme)
  const [changeTheme, setChangeTheme] = useState(
    localStorage.getItem('theme')
      ? JSON.parse(localStorage.getItem('theme') || '')
      : true
  )

  const baseUrl = import.meta.env.BASE_URL || '/'
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`

  const routerConfig = createBrowserRouter(
    getRoutesConfig(customRouters, defaultRoutePath),
    { basename: normalizedBaseUrl }
  )

  useEffect(() => {
    return routerConfig.subscribe((state) => {
      const location = state.location
      const prevRoute = sessionStorage.getItem('prevRoute')

      if (
        location.pathname !== routePaths.error &&
        location.pathname !== routePaths.login &&
        location.pathname !== prevRoute
      ) {
        sessionStorage.setItem('prevRoute', location.pathname)
      }
    })
  }, [routerConfig])

  useEffect(() => {
    setTheme(() => (changeTheme ? darkTheme : lightTheme))
  }, [changeTheme])

  return (
    <div>
      <Context.Provider
        value={{
          setTheme,
          setChangeTheme,
          changeTheme
        }}
      >
        <ConfigProvider theme={themes} locale={ruRu} {...configProviderProps}>
          <RouterProvider router={routerConfig} />
        </ConfigProvider>
      </Context.Provider>
    </div>
  )
}

export default AdminBase
