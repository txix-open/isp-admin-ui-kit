import { message } from 'antd'
import axios, { AxiosError } from 'axios'

import { localStorageKeys } from '@constants/localStorageKeys'

import { getConfigProperty } from '@utils/configUtils'
import { LocalStorage } from '@utils/localStorageUtils'
import { getCleanPath } from '@utils/routeUtils'

import { routePaths } from '@routes/routePaths'

import { MSPError } from '@type/index'

export const apiService = axios.create({
  timeout: 15000,
  data: {}
})

apiService.defaults.headers.post['X-APPLICATION-TOKEN'] = getConfigProperty(
  'APP_TOKEN',
  import.meta.env.VITE_APP_TOKEN
)

apiService.defaults.headers.get['X-APPLICATION-TOKEN'] = getConfigProperty(
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
    if (error.response && error.response.status === 401) {
      localClear()
      const prevRoute = sessionStorage.getItem('prevRoute') || ''
      message.error('Ваша сессия истекла"').then()
      sessionStorage.setItem('prevRoute', getCleanPath(prevRoute))
      window.location.href = routePaths.login
    }

    if (error.response && error.response.status === 403) {
      message
        .warning(
          'К сожалению, некоторые данные недоступны — у вас нет прав для их просмотра'
        )
        .then()
    }

    if (error.response && error.response.status >= 500) {
      message
        .error('Внутренняя ошибка сервиса, попробуйте повторить запрос')
        .then()
    }

    return Promise.reject(error)
  }
)
