import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths.ts'

import { axiosBaseQuery } from '@utils/apiUtils.ts'

import { AppApiResponseType, DomainType } from '@type/app.type.ts'

const appApi = createApi({
  reducerPath: 'appService',
  refetchOnFocus: true,
  tagTypes: ['SystemTreeApps', 'Application'],
  baseQuery: axiosBaseQuery({ baseUrl: apiPaths.baseSystemUrl }),
  endpoints: (builder) => ({
    getSystemTree: builder.query<AppApiResponseType, void>({
      query: () => ({ url: apiPaths.getSystemTree }),
      transformResponse: (response: DomainType[]) => {
        const apps = response.flatMap(({ services }) =>
          services.flatMap(({ apps }) => apps)
        )

        return {
          originalResponse: response,
          appList: apps
        }
      },
      providesTags: () => ['SystemTreeApps']
    })
  })
})

export default appApi
