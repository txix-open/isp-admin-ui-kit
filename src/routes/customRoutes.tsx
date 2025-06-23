import { RouteObject } from 'react-router-dom'

import { CustomMenuItemType } from '@components/Layout/layout.type.ts'

export const generateCustomRoutes = (
  customRouters: CustomMenuItemType[]
): RouteObject[] => {
  return customRouters.flatMap(({ route, element, children }) => {
    const paths = Array.isArray(route) ? route : [route]

    return paths.map((path) => ({
      path: path,
      element: element,
      children: children?.length ? generateCustomRoutes(children) : []
    }))
  })
}
