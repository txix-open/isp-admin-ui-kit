import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths.ts'

import {
  ApplicationTokenType,
  NewApplicationTokenType,
  RevokeTokenType
} from '@pages/ApplicationsPage/applications.type.ts'

import { axiosBaseQuery } from '@utils/apiUtils.ts'

const tokensApi = createApi({
  reducerPath: 'tokensApi',
  refetchOnFocus: true,
  tagTypes: ['Tokens'],
  baseQuery: axiosBaseQuery({ baseUrl: apiPaths.baseSystemUrl }),
  endpoints: (builder) => ({
    createToken: builder.mutation<
      ApplicationTokenType,
      NewApplicationTokenType
    >({
      query: (NewApplicationTokenType) => ({
        url: apiPaths.createToken,
        data: NewApplicationTokenType
      }),
      invalidatesTags: ['Tokens']
    }),

    getTokensByAppId: builder.query<ApplicationTokenType[], { id: number }>({
      query: (id) => ({
        url: apiPaths.getTokensByAppId,
        data: id
      }),
      providesTags: ['Tokens']
    }),
    revokeTokens: builder.mutation<void, RevokeTokenType>({
      query: (el) => ({
        url: apiPaths.revokeTokens,
        data: el
      }),
      invalidatesTags: ['Tokens']
    })
  })
})

export default tokensApi
