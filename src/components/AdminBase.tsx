import { ConfigProvider } from 'antd'
import ruRu from 'antd/locale/ru_RU'
import { FC, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { darkTheme, lightTheme } from '@constants/theme.ts'

import { AdminBasePropsType } from '@components/admin-base.type.ts'

import { Context } from '@stores/index'

import Routers from '@routes/Routers'
import { routePaths } from '@routes/routePaths.ts'

import './admin-base.scss'

const AdminBase: FC<AdminBasePropsType> = ({
  customRouters = [],
  configProviderProps = {}
}) => {
  const [themes, setTheme] = useState(lightTheme)
  const [changeTheme, setChangeTheme] = useState(
    localStorage.getItem('theme')
      ? JSON.parse(localStorage.getItem('theme') || '')
      : true
  )

  const location = useLocation()

  useEffect(() => {
    const prevRoute = sessionStorage.getItem('prevRoute')
    if (
      location.pathname !== routePaths.error &&
      location.pathname !== routePaths.login &&
      location.pathname !== prevRoute
    ) {
      sessionStorage.setItem('prevRoute', location.pathname)
    }
  }, [location])

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
          <Routers customRouters={customRouters} />
        </ConfigProvider>
      </Context.Provider>
    </div>
  )
}

export default AdminBase
