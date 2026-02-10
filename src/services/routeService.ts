import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths'

import { axiosBaseQuery } from '@utils/apiUtils'

import {
  EndpointType,
  RouteApiResponseType,
  RouteType
} from '@type/accessList.type'

const routeApi = createApi({
  reducerPath: 'routeApi',
  refetchOnFocus: true,
  tagTypes: ['Routes'],
  baseQuery: axiosBaseQuery({ baseUrl: apiPaths.baseConfigUrl }),
  endpoints: (builder) => ({
    getAllRoutes: builder.query<RouteApiResponseType, void>({
      query: () => ({ url: apiPaths.getAllRoutes }),
      transformResponse: (response: RouteType[]) => {
        const moduleEndpoints: Record<string, EndpointType[]> = {}
        const allRouteMap: Record<string, EndpointType> = {}

        response.forEach((route) => {
          if (route.endpoints && route.endpoints.length) {
            moduleEndpoints[route.moduleName] = route.endpoints
          }
        })
        Object.keys(moduleEndpoints)
          .sort()
          .forEach((groupName) => {
            moduleEndpoints[groupName].forEach((method) => {
              allRouteMap[method.path] = method
            })
          })

        return {
          originalResponse: response,
          moduleEndpoints: moduleEndpoints,
          allRouteMap: allRouteMap
        }
      },
      providesTags: () => ['Routes']
    })
  })
})

export default routeApi
