import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths.ts'

import { axiosBaseQuery } from '@utils/apiUtils.ts'

import { NewRoleType, RoleType } from '@type/roles.type.ts'

const roleApi = createApi({
  reducerPath: 'roleApi',
  refetchOnFocus: true,
  tagTypes: ['Roles'],
  baseQuery: axiosBaseQuery({ baseUrl: apiPaths.baseAdminUrl }),
  endpoints: (builder) => ({
    getAllRoles: builder.query<RoleType[], void>({
      query: () => ({ url: apiPaths.getAllRoles }),
      providesTags: () => ['Roles']
    }),
    createRole: builder.mutation<RoleType, NewRoleType>({
      query: (newRole) => ({
        url: apiPaths.createRole,
        data: newRole
      }),
      invalidatesTags: ['Roles']
    }),
    updateRole: builder.mutation<void, RoleType>({
      query: (role) => ({
        url: apiPaths.updateRole,
        data: role
      }),
      invalidatesTags: ['Roles']
    }),
    removeRole: builder.mutation<void, number>({
      query: (id) => ({
        url: apiPaths.deleteRole,
        data: { id }
      }),
      invalidatesTags: ['Roles']
    })
  })
})

export default roleApi
