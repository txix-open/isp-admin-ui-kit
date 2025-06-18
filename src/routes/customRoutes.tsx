import { Spin } from 'antd'
import { Suspense } from 'react'
import { Route } from 'react-router-dom'

import { CustomMenuItemType } from '@components/Layout/layout.type.ts'

export const generateCustomRoutes = (
  customRouters: CustomMenuItemType[]
): JSX.Element[] => {
  return customRouters.flatMap(({ key, route, element, children }) => {
    const routes = Array.isArray(route)
      ? route.map((r) => (
          <Route
            key={`${key}-${r}`}
            path={r}
            element={<Suspense fallback={<Spin />}>{element}</Suspense>}
          />
        ))
      : [
          <Route
            key={key}
            path={route}
            element={<Suspense fallback={<Spin />}>{element}</Suspense>}
          />
        ]

    const childRoutes = children?.length ? generateCustomRoutes(children) : []

    return [...routes, ...childRoutes]
  })
}
