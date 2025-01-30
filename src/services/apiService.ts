import { message } from 'antd'
import axios, { AxiosError } from 'axios'

import { localStorageKeys } from '@constants/localStorageKeys.ts'

import { getConfigProperty } from '@utils/configUtils.ts'
import { LocalStorage } from '@utils/localStorageUtils.ts'

import { routePaths } from '@routes/routePaths.ts'

import { MSPError } from '@type/index.ts'

export const apiService = axios.create({
  timeout: 15000,
  data: {}
})

apiService.defaults.headers.post['X-APPLICATION-TOKEN'] = getConfigProperty(
  'APP_TOKEN',
  import.meta.env.VITE_APP_TOKEN
)

apiService.interceptors.request.use(
  async (config: any) => {
    const headerName = LocalStorage.get(localStorageKeys.HEADER_NAME)
    config.headers[headerName] = LocalStorage.get(localStorageKeys.USER_TOKEN)

    return config
  },
  (error: AxiosError<MSPError>) => Promise.reject(error)
)

const localClear = () => {
  LocalStorage.remove(localStorageKeys.USER_TOKEN)
  LocalStorage.remove(localStorageKeys.HEADER_NAME)
}

apiService.interceptors.response.use(
  async (response: any) => response,
  (error: AxiosError<MSPError>) => {
    console.error(error)
    if (error.response && error.response.status === 401) {
      localClear()
      const prevRoute = sessionStorage.getItem('prevRoute') || ''
      message.error('Ваша сессия истекла"').then()
      sessionStorage.setItem('prevRoute', prevRoute)
      window.location.href = routePaths.login
    }

    if (error.response && error.response.status >= 500) {
      message
        .error('Внутренняя ошибка сервиса, попробуйте повторить запрос')
        .then()
    }

    return Promise.reject(error)
  }
)
