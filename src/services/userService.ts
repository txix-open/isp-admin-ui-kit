import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths'

import { axiosBaseQuery } from '@utils/apiUtils'
import { getApplicationGroup } from '@utils/configUtils'

import { PermissionType } from '@type/roles.type'
import type { TableSearchParams } from '@type/table-search.type'
import { NewUserType, UserResponseType, UserType } from '@type/user.type'

const userServiceApi = createApi({
  reducerPath: 'userServiceApi',
  refetchOnFocus: true,
  tagTypes: ['users', 'permissions'],
  baseQuery: axiosBaseQuery({ baseUrl: apiPaths.baseUserUrl }),
  endpoints: (builder) => ({
    getAllUsers: builder.query<UserType[], TableSearchParams | void>({
      query: (request) => ({
        url: apiPaths.getUsers,
        data: { ...request, limit: 1000 }
      }),
      transformResponse: (response: UserResponseType) => response.items,
      providesTags: () => ['users']
    }),
    getAllPermissions: builder.query<PermissionType[], void>({
      query: () => ({
        url: apiPaths.getAllPermissions,
        data: { applicationGroup: getApplicationGroup() }
      }),
      providesTags: () => ['permissions']
    }),
    blockUser: builder.mutation<void, number>({
      query: (userId) => ({ url: apiPaths.blockUser, data: { userId } }),
      invalidatesTags: () => ['users']
    }),
    deleteUser: builder.mutation<void, number>({
      query: (userId) => ({
        url: apiPaths.deleteUser,
        data: { ids: [userId] }
      }),
      invalidatesTags: () => ['users']
    }),
    createUser: builder.mutation<UserType, NewUserType>({
      query: (newUser) => ({
        url: apiPaths.createUser,
        data: newUser
      }),
      invalidatesTags: ['users']
    }),

    updateUser: builder.mutation<void, Omit<UserType, 'lastSessionCreatedAt'>>({
      query: (user) => ({
        url: apiPaths.updateUser,
        data: user
      }),
      invalidatesTags: ['users']
    })
  })
})

export default userServiceApi
