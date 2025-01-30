import { BaseQueryFn, retry } from '@reduxjs/toolkit/query/react'
import { AxiosError, AxiosRequestConfig } from 'axios'

import { apiService } from '@services/apiService.ts'

import { MSPError } from '@type/index.ts'

export const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' }
  ): BaseQueryFn<
    {
      url: string
      method?: AxiosRequestConfig['method']
      data?: AxiosRequestConfig['data']
      params?: AxiosRequestConfig['params']
    },
    unknown,
    unknown
  > =>
  async ({ url, method = 'post', data, params }) => {
    try {
      const result = await apiService({
        url: baseUrl + url,
        method,
        data,
        params
      })
      return { data: result.data }
    } catch (axiosError) {
      const err = axiosError as AxiosError<MSPError>
      return {
        error: { ...err.response }
      }
    }
  }

export const staggeredBaseQueryWithBailOut = (baseUrl: string) =>
  retry(
    async (args: string | AxiosRequestConfig['data'], api, extraOptions) => {
      const result = await axiosBaseQuery({ baseUrl })(args, api, extraOptions)
      const error = result.error as AxiosError<MSPError>
      if (error && error?.status === 400) {
        retry.fail(result.error)
      }

      return result
    },
    {
      maxRetries: 5
    }
  )
