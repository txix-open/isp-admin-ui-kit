import { useMutation } from './application-service-fixtures'

const fixtures = () => window.layoutFixtures

function mutation(name) {
  return [
    (args) => {
      fixtures().mutationCalls.push({ name, args })
      throw new Error('Service mutations are disabled in module layout tests')
    },
    { isLoading: false }
  ]
}

export const modulesApi = {
  useGetModulesQuery: () => ({
    data: fixtures().modules,
    isLoading: false,
    ...fixtures().queryStates.modules,
    refetch: () => {
      fixtures().retried = 'modules'
    }
  }),
  useGetByModuleIdQuery: () => {
    const data = {
      schema: fixtures().configurationSchema ?? { type: 'object' }
    }
    return { data, currentData: data, isLoading: false }
  },
  useGetRequiredModulesQuery: () => ({
    data: [],
    isLoading: false,
    isFetching: false,
    isError: false,
    ...fixtures().queryStates.map,
    refetch: () => ({ unwrap: () => Promise.resolve() })
  }),
  useRemoveModuleMutation: () => mutation('deleteModule')
}

export const configApi = {
  useGetConfigsByModuleIdQuery: (id, options = {}) => {
    const configs = fixtures().moduleConfigs?.[id] ?? []
    const data = options.skip
      ? undefined
      : {
          originalResponse: configs,
          activeConfigs: configs.filter((config) => config.active),
          inactiveConfigs: configs.filter((config) => !config.active)
        }
    return {
      data,
      currentData: data,
      isLoading: false,
      isFetching: false,
      ...fixtures().queryStates.configurations,
      refetch: () => {
        fixtures().retried = 'configurations'
      }
    }
  },
  useGetConfigByIdQuery: (id, options = {}) => {
    const data = options.skip
      ? undefined
      : (Object.values(fixtures().moduleConfigs ?? {})
          .flat()
          .find((config) => config.id === id) ?? {
          name: 'Тестовая конфигурация',
          version: 1,
          data: {}
        })
    return { data, currentData: data, isLoading: false }
  },
  useGetAllVersionQuery: () => ({
    data: fixtures().versions,
    currentData: fixtures().versions,
    ...fixtures().queryStates.versions
  }),
  useUpdateConfigNameMutation: () => mutation('renameConfig'),
  useMarkConfigAsActiveMutation: () => mutation('activateConfig'),
  useDeleteConfigMutation: () => mutation('deleteConfig'),
  useDeleteVersionMutation: () => mutation('deleteVersion'),
  useCreateUpdateConfigMutation: () => useMutation('saveConfig')
}
