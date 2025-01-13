import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths.ts'

import {
  ModuleType,
  ResponseSchemaType
} from '@pages/ModulesPage/module.type.ts'

import { axiosBaseQuery } from '@utils/apiUtils.ts'

const modulesServiceApi = createApi({
  reducerPath: 'modulesServiceApi',
  refetchOnFocus: false,
  tagTypes: ['modules', 'schema'],
  baseQuery: axiosBaseQuery({ baseUrl: apiPaths.baseConfigUrl }),
  endpoints: (builder) => ({
    getModules: builder.query<ModuleType[], string>({
      query: () => ({ url: apiPaths.getModules, data: { limit: 1000 } }),
      providesTags: () => ['modules']
    }),
    removeModule: builder.mutation<void, string>({
      query: (id) => ({
        url: apiPaths.deleteModule,
        data: [id]
      }),
      invalidatesTags: ['modules']
    }),
    getByModuleId: builder.query<ResponseSchemaType, string>({
      query: (moduleId) => ({
        url: apiPaths.getByModuleId,
        data: { moduleId }
      }),
      providesTags: () => ['schema']
    })
  })
})

export default modulesServiceApi
