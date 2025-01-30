import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths'

import { axiosBaseQuery } from '@utils/apiUtils'

import { LimitOffsetRequestType } from '@type/index.ts'
import { LogEventType, LogResponseType, SetEventType } from '@type/log.type'

const securityLogServiceApi = createApi({
  reducerPath: 'securityLogService',
  refetchOnFocus: true,
  tagTypes: ['logs', 'events'],
  baseQuery: axiosBaseQuery({ baseUrl: apiPaths.baseAdminUrl }),
  endpoints: (builder) => ({
    getAllLogs: builder.mutation<LogResponseType, LimitOffsetRequestType>({
      query: (request) => ({ url: apiPaths.getAllLogs, data: request }),
      invalidatesTags: () => ['logs']
    }),
    getLogEvents: builder.query<LogEventType[], void>({
      query: () => ({ url: apiPaths.getLogEvents }),
      providesTags: () => ['events']
    }),
    setLogEvents: builder.mutation<void, SetEventType[]>({
      query: (request) => ({ url: apiPaths.setLogEvents, data: request }),
      invalidatesTags: () => ['events']
    })
  })
})

export default securityLogServiceApi
