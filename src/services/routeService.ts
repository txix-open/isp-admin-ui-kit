import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths.ts'

import { axiosBaseQuery } from '@utils/apiUtils.ts'

import {
  EndpointType,
  RouteApiResponseType,
  RouteType
} from '@type/accessList.type.ts'

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
