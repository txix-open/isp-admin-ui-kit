import { ConfigProvider } from 'antd'
import ruRu from 'antd/locale/ru_RU'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { darkTheme, lightTheme } from '@constants/theme.ts'

import { Context } from '@stores/index.tsx'

import Routers from '@routes/Routers'
import { routePaths } from '@routes/routePaths.ts'

import './app.scss'

const App = () => {
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
    <div className="app">
      <Context.Provider value={{ setTheme, setChangeTheme, changeTheme }}>
        <ConfigProvider theme={themes} locale={ruRu}>
          <Routers />
        </ConfigProvider>
      </Context.Provider>
    </div>
  )
}

export default App
