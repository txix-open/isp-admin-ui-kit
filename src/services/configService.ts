import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths.ts'

import { ConfigResponse, ConfigType } from '@pages/ModulesPage/module.type.ts'

import { axiosBaseQuery } from '@utils/apiUtils.ts'

import { VersionType } from '@type/version.type.ts'

const configServiceApi = createApi({
  reducerPath: 'configApi',
  tagTypes: ['configs', 'versions', 'config'],
  baseQuery: axiosBaseQuery({ baseUrl: apiPaths.baseConfigUrl }),
  endpoints: (builder) => ({
    getConfigsByModuleId: builder.query<ConfigResponse, string>({
      query: (moduleId) => ({
        url: apiPaths.getConfigsByModuleId,
        data: { moduleId }
      }),
      transformResponse: (response: ConfigType[]): ConfigResponse => {
        const activeObjects: ConfigType[] = []
        const inactiveObjects: ConfigType[] = []
        response.forEach((obj) => {
          if (obj.active) {
            activeObjects.push(obj)
          } else {
            inactiveObjects.push(obj)
          }
        })
        return {
          originalResponse: response,
          activeConfigs: activeObjects,
          inactiveConfigs: inactiveObjects
        }
      },
      providesTags: () => ['configs']
    }),
    getConfigById: builder.query<ConfigType, string>({
      query: (id) => ({
        url: apiPaths.getConfigById,
        data: { id }
      }),
      providesTags: () => ['config']
    }),
    getAllVersion: builder.query<VersionType[], string>({
      query: (id) => ({
        url: apiPaths.getAllVersions,
        data: { id }
      }),
      transformResponse: (response: VersionType[]) => {
        return response.sort((a, b) => b.configVersion - a.configVersion)
      },
      providesTags: () => ['versions']
    }),
    createUpdateConfig: builder.mutation<ConfigType, ConfigType>({
      query: (data) => ({ url: apiPaths.createUpdateConfig, data }),
      invalidatesTags: () => ['configs', 'versions', 'config']
    }),
    deleteVersion: builder.mutation<void, string>({
      query: (id) => ({ url: apiPaths.deleteVersion, data: { id } }),
      invalidatesTags: () => ['versions']
    }),
    deleteConfig: builder.mutation<void, string>({
      query: (id) => ({ url: apiPaths.deleteConfig, data: [id] }),
      invalidatesTags: () => ['configs']
    }),
    markConfigAsActive: builder.mutation<void, string>({
      query: (id) => ({ url: apiPaths.markConfigAsActive, data: { id } }),
      invalidatesTags: () => ['configs']
    })
  })
})

export default configServiceApi
