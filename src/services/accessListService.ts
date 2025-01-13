import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths.ts'

import { axiosBaseQuery } from '@utils/apiUtils.ts'

import {
  AccessListMethodType,
  AccessListSetListRequestType,
  AccessListSetListSetOneRequestType
} from '@type/accessList.type.ts'

const accessListApi = createApi({
  reducerPath: 'accessListApi',
  refetchOnFocus: true,
  tagTypes: ['AccessItems'],
  baseQuery: axiosBaseQuery({ baseUrl: apiPaths.baseSystemUrl }),
  endpoints: (builder) => ({
    getById: builder.query<AccessListMethodType[], { id: number }>({
      query: ({ id }) => ({ url: apiPaths.getById, data: { id } }),
      providesTags: () => ['AccessItems']
    }),
    setList: builder.mutation<
      AccessListMethodType[],
      AccessListSetListRequestType
    >({
      query: (data) => ({ url: apiPaths.setList, data }),
      invalidatesTags: () => ['AccessItems']
    }),
    setOne: builder.mutation<void, AccessListSetListSetOneRequestType>({
      query: (data) => ({ url: apiPaths.setOne, data }),
      invalidatesTags: () => ['AccessItems']
    })
  })
})

export default accessListApi
