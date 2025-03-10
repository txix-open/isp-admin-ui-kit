import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths.ts'

import { axiosBaseQuery } from '@utils/apiUtils.ts'

const variablesApi = createApi({
  reducerPath: 'variablesService',
  baseQuery: axiosBaseQuery({ baseUrl: apiPaths.baseConfigUrl }),
  tagTypes: ['Variables'],
  endpoints: (builder) => ({
    getAllVariables: builder.query<VariableType[], void>({
      query: () => ({ url: apiPaths.getAllVariables }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ name }) => ({
                type: 'Variables' as const,
                id: name
              })),
              { type: 'Variables', id: 'LIST' }
            ]
          : [{ type: 'Variables', id: 'LIST' }]
    }),

    getVariableByName: builder.query<VariableType, string>({
      query: (name) => ({
        url: apiPaths.getVariableByName,
        data: { name }
      }),
      providesTags: (_, __, name) => [{ type: 'Variables', id: name }]
    }),

    createVariable: builder.mutation<VariableType, NewVariableType>({
      query: (newVariable) => ({
        url: apiPaths.createVariable, // Убедитесь в правильности URL
        data: newVariable
      }),
      invalidatesTags: [{ type: 'Variables', id: 'LIST' }]
    }),

    deleteVariable: builder.mutation<void, string>({
      query: (name) => ({
        url: apiPaths.deleteVariable,
        data: { name }
      }),
      invalidatesTags: (_, __, name) => [
        { type: 'Variables', id: name },
        { type: 'Variables', id: 'LIST' }
      ]
    }),

    updateVariable: builder.mutation<VariableType, UpdateVariableType>({
      query: (data) => ({
        url: apiPaths.updateVariable,
        data: data
      }),
      invalidatesTags: (_, __, { name }) => [
        { type: 'Variables', id: name },
        { type: 'Variables', id: 'LIST' }
      ]
    }),

    upsertVariables: builder.mutation<void, UpdateVariableType[]>({
      query: (data) => ({
        url: apiPaths.upsertVariables,
        data: data
      }),
      invalidatesTags: () => [{ type: 'Variables', id: 'LIST' }]
    })
  })
})

export default variablesApi
