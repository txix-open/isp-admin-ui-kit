import { Spin } from 'antd'
import { Suspense } from 'react'
import { Route } from 'react-router-dom'

import { CustomMenuItemType } from '@type/app.type.ts'

export const generateCustomRoutes = (customRouters: CustomMenuItemType[]): JSX.Element[] => {
  return customRouters.map(({ key, route, element, children }) => (
    <>
      <Route
        key={key}
        path={route}
        element={<Suspense fallback={<Spin />}>{element}</Suspense>}
      />
      {children && children.length > 0 && generateCustomRoutes(children)}
    </>
  ))
}
