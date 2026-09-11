import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths'

import { SearchAppByTokenType } from '@ui/SearchAppByToken'

import {
  ApplicationAppType,
  ApplicationsGroupType,
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
      async queryFn(_arg, _queryApi, _extraOptions, baseQuery) {
        const applicationsGroupsResult = await baseQuery({
          url: apiPaths.getAllApplicationGroup
        })

        if (applicationsGroupsResult.error) {
          return { error: applicationsGroupsResult.error }
        }

        const applicationsGroups =
          applicationsGroupsResult.data as ApplicationsGroupType[]
        const applicationsResults = await Promise.all(
          applicationsGroups.map((group) =>
            baseQuery({
              url: apiPaths.getApplicationsByAppGroup,
              data: { id: group.id }
            })
          )
        )
        const applicationsError = applicationsResults.find(
          (result) => result.error
        )

        if (applicationsError?.error) {
          return { error: applicationsError.error }
        }

        return {
          data: applicationsResults.flatMap(
            (result) => result.data as ApplicationAppType[]
          )
        }
      },
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
