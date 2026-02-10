import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths'

import {
  ApplicationsGroupType,
  NewApplicationsGroupType,
  UpdateApplicationsGroupType
} from '@pages/ApplicationsPage/applications.type'

import { axiosBaseQuery } from '@utils/apiUtils'

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

    getApplicationGroupGetByIdList: builder.query<
      ApplicationsGroupType[],
      { id: number }
    >({
      query: (id) => ({
        url: apiPaths.getByIdListApplicationGroup,
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

    getAllApplicationsGroup: builder.query<ApplicationsGroupType[], void>({
      query: () => ({ url: apiPaths.getAllApplicationGroup }),
      providesTags: () => ['ApplicationsGroup']
    }),

    createApplicationsGroup: builder.mutation<
      ApplicationsGroupType,
      NewApplicationsGroupType
    >({
      query: (newApplicationsGroup) => ({
        url: apiPaths.createApplicationGroup,
        data: newApplicationsGroup
      }),
      invalidatesTags: ['ApplicationsGroup']
    }),

    updateApplicationsGroup: builder.mutation<
      void,
      UpdateApplicationsGroupType
    >({
      query: (updateApplicationsGroup) => ({
        url: apiPaths.updateApplicationGroup,
        data: updateApplicationsGroup
      }),
      invalidatesTags: ['ApplicationsGroup']
    }),

    removeApplicationsGroup: builder.mutation<void, { idList: number[] }>({
      query: (id) => ({
        url: apiPaths.deleteListApplicationGroup,
        data: id
      }),
      invalidatesTags: ['ApplicationsGroup']
    })
  })
})

export default applicationsGroupApi
