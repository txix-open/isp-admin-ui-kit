import axios, { AxiosError } from 'axios'

import {
  localStorageKeys,
  sessionStorageKeys
} from '@constants/localStorageKeys'

import {
  ignoreApiError,
  notifyApiError,
  scheduleApiError
} from '@utils/apiErrorNotifications'
import { getConfigProperty } from '@utils/configUtils'
import { LocalStorage } from '@utils/localStorageUtils'
import { getCleanPath } from '@utils/routeUtils'

import { routePaths } from '@routes/routePaths'

import { MSPError } from '@type/index'

export const apiService = axios.create({
  timeout: 15000,
  data: {}
})

apiService.defaults.headers.common['X-APPLICATION-TOKEN'] = getConfigProperty(
  'APP_TOKEN',
  import.meta.env.VITE_APP_TOKEN
)

apiService.interceptors.request.use(
  (config) => {
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

let redirectingToLogin = false

const getErrorMessage = (error: AxiosError<MSPError>) => {
  if (error.response?.status === 403)
    return 'Недостаточно прав для выполнения запроса'
  if (error.response && error.response.status >= 500)
    return 'Внутренняя ошибка сервиса, попробуйте повторить запрос'
  if (error.code === 'ECONNABORTED')
    return 'Сервис не ответил вовремя. Попробуйте повторить запрос'
  if (!error.response) return 'Не удалось подключиться к сервису'
  return 'Не удалось выполнить запрос'
}

apiService.interceptors.response.use(
  (response) => response,
  (error: AxiosError<MSPError>) => {
    if (error.response && error.response.status === 401) {
      localClear()
      const prevRoute =
        sessionStorage.getItem(sessionStorageKeys.PREV_ROUTE) || ''
      if (!redirectingToLogin) {
        redirectingToLogin = true
        notifyApiError(error, 'Ваша сессия истекла')
      } else {
        ignoreApiError(error)
      }
      sessionStorage.setItem(
        sessionStorageKeys.PREV_ROUTE,
        getCleanPath(prevRoute)
      )
      window.location.href = routePaths.login
      return Promise.reject(error)
    }

    if (axios.isCancel(error)) {
      ignoreApiError(error)
    } else {
      scheduleApiError(error, getErrorMessage(error))
    }

    return Promise.reject(error)
  }
)
