import { createApi } from '@reduxjs/toolkit/query/react'

import { API_BASE_URL } from '@constants/api/apiPaths'

import { axiosBaseQuery } from '@utils/apiUtils'

const swaggerServiceApi = createApi({
  reducerPath: 'swaggerServiceApi',
  refetchOnFocus: false,
  tagTypes: ['swagger'],
  baseQuery: axiosBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    getSwagger: builder.query<string, string>({
      query: (url) => ({
        method: 'GET',
        url: url
      }),
      providesTags: ['swagger']
    })
  })
})

export default swaggerServiceApi
