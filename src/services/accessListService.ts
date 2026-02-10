import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths'

import { axiosBaseQuery } from '@utils/apiUtils'

import {
  AccessListDeleteListRequestType,
  AccessListMethodType,
  AccessListSetListRequestType,
  AccessListSetListSetOneRequestType
} from '@type/accessList.type'

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
    }),
    deleteList: builder.mutation<void, AccessListDeleteListRequestType>({
      query: (data) => ({ url: apiPaths.deleteList, data }),
      invalidatesTags: () => ['AccessItems']
    })
  })
})

export default accessListApi
