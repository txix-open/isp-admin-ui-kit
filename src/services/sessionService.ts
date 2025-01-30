import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths'

import { axiosBaseQuery } from '@utils/apiUtils'

import { LimitOffsetRequestType } from '@type/index.ts'
import { SessionResponseType } from '@type/session.type'

const sessionServiceApi = createApi({
  reducerPath: 'sessionService',
  refetchOnFocus: true,
  tagTypes: ['sessions'],
  baseQuery: axiosBaseQuery({ baseUrl: apiPaths.baseAdminUrl }),
  endpoints: (builder) => ({
    getAllSessions: builder.query<SessionResponseType, LimitOffsetRequestType>({
      query: (request) => ({ url: apiPaths.getAllSession, data: request }),
      providesTags: () => ['sessions']
    }),
    revokeSession: builder.mutation<void, number>({
      query: (id) => ({ url: apiPaths.revokeSession, data: { id } }),
      invalidatesTags: () => ['sessions']
    })
  })
})

export default sessionServiceApi
