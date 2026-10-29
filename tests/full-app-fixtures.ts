import axios, { AxiosError } from 'axios'

import { useMutation } from './application-service-fixtures'

const fixtures = () => window.layoutFixtures
const session = { headerName: 'X-TEST-SESSION', token: 'fixture-session' }

export function configureOfflineAuth(authenticated: boolean) {
  localStorage.removeItem('OAUTH_LOGIN')
  sessionStorage.clear()
  for (const [key, value] of Object.entries({
    USER_TOKEN: session.token,
    HEADER_NAME: session.headerName
  })) {
    if (authenticated) localStorage.setItem(key, value)
    else localStorage.removeItem(key)
  }
  const auth = (path: string, body: unknown) => {
    fixtures().authCalls.push({ path, body })
    const failure = fixtures().authFailures?.[path]
    if (failure) return { status: failure, data: { errorCode: failure } }
    if (
      path.endsWith('/auth/login') ||
      path.endsWith('/auth/login_with_oauth')
    ) {
      return { status: 200, data: session }
    }
    if (path.endsWith('/auth/logout')) return { status: 200, data: {} }
    throw new Error(`Unexpected offline auth request: ${path}`)
  }
  fixtures().authCalls = []
  window.fetch = async (input, init) => {
    const path = new URL(String(input), location.href).pathname
    const { status, data } = auth(
      path,
      init?.body ? JSON.parse(String(init.body)) : undefined
    )
    return new Response(JSON.stringify(data), { status })
  }
  axios.defaults.adapter = async (config) => {
    const path = new URL(config.url ?? '', location.href).pathname
    const { status, data } = auth(
      path,
      config.data ? JSON.parse(config.data) : undefined
    )
    const response = {
      config,
      status,
      data,
      headers: {},
      statusText: String(status)
    }
    if (status >= 400)
      throw new AxiosError(
        'Offline request failed',
        undefined,
        config,
        undefined,
        response
      )
    return response
  }
}

export const gitConfigurationApi = {
  useCredentialsQuery: () => ({
    data: [
      {
        name: 'Конфигурации сервиса',
        dirPath: 'configs',
        repositoryUrl: 'https://example.test/configurations.git'
      }
    ],
    ...fixtures().queryStates.git
  }),
  useCreateCredentialsMutation: () => useMutation('createGit'),
  useUpdateCredentialsMutation: () => useMutation('updateGit'),
  useDeleteCredentialsMutation: () => useMutation('deleteGit'),
  useGitDirMutation: () => useMutation('gitDir'),
  useGitCommitsMutation: () => useMutation('gitCommits'),
  useGitFileMutation: () => useMutation('gitFile'),
  useConfigMergeMutation: () => useMutation('gitMerge')
}

export const accessApi = {
  useGetByIdQuery: () => ({ data: fixtures().accessMethods, isSuccess: true }),
  useSetListMutation: () => useMutation('saveAccess'),
  useDeleteListMutation: () => useMutation('deleteAccess')
}

export const swaggerApi = {
  useGetSwaggerQuery: (path, { skip }) => {
    fixtures().queryCalls.push({ service: 'swagger', args: path, skip })
    return {
      currentData: skip ? undefined : fixtures().swaggerSpec,
      ...fixtures().queryStates.swagger,
      refetch: () => {
        fixtures().retried = 'swagger'
      }
    }
  }
}
