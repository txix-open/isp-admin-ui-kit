import { Spin } from 'antd'
import { Suspense } from 'react'
import { Route } from 'react-router-dom'

import { CustomMenuItemType } from '@type/app.type.ts'

export const generateCustomRoutes = (customRouters: CustomMenuItemType[]) => {
  return customRouters.map(({ key, path, element }) => (
    <Route
      key={key}
      path={path}
      element={<Suspense fallback={<Spin />}>{element}</Suspense>}
    />
  ))
}
