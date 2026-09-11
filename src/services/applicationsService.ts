import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths'

import { SearchAppByTokenType } from '@ui/SearchAppByToken'

import {
  ApplicationAppType,
  NewApplicationAppType,
  UpdateApplicationAppType
} from '@pages/ApplicationsPage/applications.type'

import { axiosBaseQuery } from '@utils/apiUtils'

const applicationsApi = createApi({
  reducerPath: 'applicationsApi',
  refetchOnFocus: true,
  tagTypes: ['Applications', 'ApplicationsSearch'],
  baseQuery: axiosBaseQuery({ baseUrl: apiPaths.baseSystemUrl }),
  endpoints: (builder) => ({
    getAllApplicationsService: builder.query<ApplicationAppType[], void>({
      query: () => ({ url: apiPaths.getAllApplications, data: [0] }),
      providesTags: () => ['Applications']
    }),

    createApplicationService: builder.mutation<
      ApplicationAppType,
      NewApplicationAppType
    >({
      query: (NewApplicationsService) => ({
        url: apiPaths.createApplication,
        data: NewApplicationsService
      }),
      invalidatesTags: ['Applications']
    }),

    getApplicationsServiceById: builder.query<
      ApplicationAppType,
      { id: number }
    >({
      query: (id) => ({
        url: apiPaths.getApplicationById,
        data: id
      }),
      providesTags: () => ['Applications']
    }),

    getApplicationsByAppGroup: builder.query<
      ApplicationAppType[],
      { id: number }
    >({
      query: (id) => ({
        url: apiPaths.getApplicationsByAppGroup,
        data: id
      }),
      providesTags: () => ['Applications']
    }),

    updateApplicationsService: builder.mutation<
      ApplicationAppType,
      UpdateApplicationAppType
    >({
      query: (updateApplications) => ({
        url: apiPaths.updateApplication,
        data: updateApplications
      }),
      invalidatesTags: ['Applications']
    }),

    removeApplicationsService: builder.mutation<void, number[]>({
      query: ([id]) => ({
        url: apiPaths.deleteApplication,
        data: [id]
      }),
      invalidatesTags: ['Applications']
    }),
    getNextAppId: builder.mutation<void, void>({
      query: () => ({
        url: apiPaths.getNextAppId
      }),
      invalidatesTags: ['Applications']
    }),
    getApplicationGetApplicationByToken: builder.mutation<
      SearchAppByTokenType,
      { token: string }
    >({
      query: ({ token }) => ({
        url: apiPaths.getApplicationGetApplicationByToken,
        data: { token }
      }),
      invalidatesTags: ['ApplicationsSearch']
    })
  })
})

export default applicationsApi
