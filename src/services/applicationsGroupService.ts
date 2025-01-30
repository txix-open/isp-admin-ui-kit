import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths.ts'

import {
  ApplicationsGroupType,
  NewApplicationsGroupType,
  UpdateApplicationsGroupType
} from '@pages/ApplicationsPage/applications.type.ts'

import { axiosBaseQuery } from '@utils/apiUtils.ts'

const applicationsGroupApi = createApi({
  reducerPath: 'applicationsGroupApi',
  refetchOnFocus: true,
  tagTypes: ['ApplicationsGroup'],
  baseQuery: axiosBaseQuery({ baseUrl: apiPaths.baseSystemUrl }),
  endpoints: (builder) => ({
    getApplicationsGroupByDomainId: builder.query<
      ApplicationsGroupType[],
      { id: number }
    >({
      query: (id) => ({
        url: apiPaths.getServicesByDomainId,
        data: id
      }),
      providesTags: () => ['ApplicationsGroup']
    }),

    getApplicationsGroupByServiceId: builder.query<
      ApplicationsGroupType[],
      { id: number }
    >({
      query: (id) => ({
        url: apiPaths.getServiceById,
        data: id
      }),
      providesTags: () => ['ApplicationsGroup']
    }),

    getAllApplicationsGroup: builder.query<
      ApplicationsGroupType[],
      { id: string }
    >({
      query: () => ({ url: apiPaths.getAllService }),
      providesTags: () => ['ApplicationsGroup']
    }),

    createApplicationsGroup: builder.mutation<
      ApplicationsGroupType,
      NewApplicationsGroupType
    >({
      query: (newApplicationsGroup) => ({
        url: apiPaths.createUpdateService,
        data: newApplicationsGroup
      }),
      invalidatesTags: ['ApplicationsGroup']
    }),

    updateApplicationsGroup: builder.mutation<
      void,
      UpdateApplicationsGroupType
    >({
      query: (updateApplicationsGroup) => ({
        url: apiPaths.createUpdateService,
        data: updateApplicationsGroup
      }),
      invalidatesTags: ['ApplicationsGroup']
    }),

    removeApplicationsGroup: builder.mutation<void, number[]>({
      query: ([id]) => ({
        url: apiPaths.deleteService,
        data: [id]
      }),
      invalidatesTags: ['ApplicationsGroup']
    })
  })
})

export default applicationsGroupApi
