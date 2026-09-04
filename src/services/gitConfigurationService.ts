import { createApi } from '@reduxjs/toolkit/query/react'

import { apiPaths } from '@constants/api/apiPaths'

import { axiosBaseQuery } from '@utils/apiUtils'

import {
  CommitType,
  CredentialsDeleteRequestType,
  CredentialsInfoType,
  CredentialsTokenRequestType,
  CredentialsType,
  GitCommitsRequestType,
  GitDirRequestType,
  GitFileRequestType,
  GitMergeRequestType,
  MergeRequestType,
  UpdateCredentialsType
} from '@type/gitConfiguration.type'

const gitConfigurationApi = createApi({
  reducerPath: 'gitConfigurationApi',
  refetchOnFocus: true,
  tagTypes: ['gitConfiguration'],

  baseQuery: axiosBaseQuery({
    baseUrl: apiPaths.baseGitConfigurationUrl
  }),

  endpoints: (builder) => ({
    configGitMerge: builder.mutation<
      Record<string, unknown>,
      GitMergeRequestType
    >({
      query: (data) => ({
        url: apiPaths.configGitMerge,
        data
      }),
      invalidatesTags: ['gitConfiguration']
    }),

    configMerge: builder.mutation<Record<string, unknown>, MergeRequestType>({
      query: (data) => ({
        url: apiPaths.configMerge,
        data
      }),
      invalidatesTags: ['gitConfiguration']
    }),

    gitCommits: builder.mutation<CommitType[], GitCommitsRequestType>({
      query: (data) => ({
        url: apiPaths.gitCommits,
        data
      }),
      invalidatesTags: ['gitConfiguration']
    }),

    gitDir: builder.mutation<string[], GitDirRequestType>({
      query: (data) => ({
        url: apiPaths.gitDir,
        data
      }),
      invalidatesTags: ['gitConfiguration']
    }),

    gitFile: builder.mutation<Record<string, unknown>, GitFileRequestType>({
      query: (data) => ({
        url: apiPaths.gitFile,
        data
      }),
      invalidatesTags: ['gitConfiguration']
    }),

    credentials: builder.query<CredentialsInfoType[], void>({
      query: () => ({
        method: 'GET',
        url: apiPaths.credentials
      }),
      providesTags: ['gitConfiguration']
    }),
    createCredentials: builder.mutation<void, CredentialsType>({
      query: (data) => ({
        url: apiPaths.credentials,
        method: 'POST',
        data
      }),
      invalidatesTags: ['gitConfiguration']
    }),

    updateCredentials: builder.mutation<void, UpdateCredentialsType>({
      query: (data) => ({
        url: apiPaths.credentials,
        method: 'PUT',
        data
      }),
      invalidatesTags: ['gitConfiguration']
    }),

    deleteCredentials: builder.mutation<void, CredentialsDeleteRequestType>({
      query: (data) => ({
        url: apiPaths.credentials,
        method: 'DELETE',
        data
      }),
      invalidatesTags: ['gitConfiguration']
    }),

    credentialsToken: builder.mutation<void, CredentialsTokenRequestType>({
      query: (data) => ({
        url: apiPaths.credentialsToken,
        data
      }),
      invalidatesTags: ['gitConfiguration']
    })
  })
})

export default gitConfigurationApi
