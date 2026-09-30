import axios from 'axios'
import { useCallback, useState } from 'react'

import { apiPaths } from '@constants/api/apiPaths'
import { localStorageKeys } from '@constants/localStorageKeys'

import { getConfigProperty } from '@utils/configUtils'
import { LocalStorage } from '@utils/localStorageUtils'

import { LoginResponse, SudirLoginRequest } from '@type/login.type'

const useSudirLogin = () => {
  const [loading, setLoading] = useState(false)

  const loginSudir = useCallback(
    async (data: SudirLoginRequest): Promise<void> => {
      setLoading(true)
      try {
        const response = await axios.post<LoginResponse>(
          apiPaths.loginWithOAuth,
          {
            authCode: data.authCode,
            clientName: getConfigProperty(
              'CLIENT_NAME',
              import.meta.env.VITE_CLIENT_NAME
            )
          },
          {
            timeout: 15000,
            headers: {
              'X-APPLICATION-TOKEN': getConfigProperty(
                'APP_TOKEN',
                import.meta.env.VITE_APP_TOKEN
              )
            }
          }
        )
        if (!response.data.headerName || !response.data.token) {
          throw new Error('Missing OAuth session')
        }
        LocalStorage.set(localStorageKeys.HEADER_NAME, response.data.headerName)
        LocalStorage.set(localStorageKeys.USER_TOKEN, response.data.token)
        LocalStorage.set(localStorageKeys.OAUTH_LOGIN, true)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { loading, loginSudir }
}

export default useSudirLogin
