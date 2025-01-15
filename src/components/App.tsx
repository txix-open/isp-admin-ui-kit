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

  const customRouters = [
    {
      path: '/profile1',
      element: <div>111</div>,
      label: 'Profile1',
      key: 'profile1',
      permissions: [],
      icon: ''
    },
    {
      path: '/profile2',
      element: <div>222</div>,
      label: 'Profile2',
      key: 'profile2',
      permissions: ['read'],
      icon: '',
      children: [
        {
          path: '/profile3',
          element: <div>333</div>,
          label: 'Profile3',
          permissions: ['read'],
          icon: '',
          key: 'profile3',
          children: [
            {
              path: '/profile4',
              element: <div>444</div>,
              label: 'Profile4',
              permissions: ['read'],
              icon: '',
              key: 'profile4',
              children: []
            }
          ]
        },
        {
          path: '/profile5',
          element: <div>555</div>,
          label: 'Profile5',
          permissions: ['read'],
          icon: '',
          key: 'profile5',
          children: [
            {
              path: '/profile6',
              element: <div>666</div>,
              label: 'Profile6',
              permissions: ['read'],
              icon: '',
              key: 'profile6',
              children: []
            }
          ]
        }
      ]
    }
  ]

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
          <Routers customRouters={customRouters}/>
        </ConfigProvider>
      </Context.Provider>
    </div>
  )
}

export default App
