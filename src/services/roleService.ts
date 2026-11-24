import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths'

import { axiosBaseQuery } from '@utils/apiUtils'
import { getConfigProperty } from '@utils/configUtils'

import { NewRoleType, RoleType } from '@type/roles.type'

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
        data: {
          ...newRole,
          applicationGroup: getConfigProperty(
            'CLIENT_NAME',
            import.meta.env.VITE_CLIENT_NAME
          )
        }
      }),
      invalidatesTags: ['Roles']
    }),
    updateRole: builder.mutation<RoleType, RoleType>({
      query: (role) => ({
        url: apiPaths.updateRole,
        data: {
          ...role,
          applicationGroup: getConfigProperty(
            'CLIENT_NAME',
            import.meta.env.VITE_CLIENT_NAME
          )
        }
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
