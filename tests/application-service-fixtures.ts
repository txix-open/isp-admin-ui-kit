import { useState } from 'react'

const fixtures = () => window.layoutFixtures

function query(name, data, args, options = {}) {
  fixtures().queryCalls.push({
    service: name,
    args,
    skip: Boolean(options.skip)
  })
  const result = options.skip ? undefined : data
  return {
    data: result,
    currentData: result,
    isLoading: false,
    isFetching: false,
    ...fixtures().queryStates[name],
    refetch: () => {
      fixtures().retried = name
    }
  }
}

function useMutation(name) {
  const [isLoading, setLoading] = useState(false)
  return [
    (args) => {
      fixtures().mutationCalls.push({ name, args })
      setLoading(true)
      const response = fixtures().mutationResults[name] ?? {
        error: new Error('Mutation disabled in fixture')
      }
      const request = response.pending
        ? new Promise((resolve, reject) => {
            fixtures().finishMutation = (result) =>
              result.error ? reject(result.error) : resolve(result.data)
          })
        : response.error
          ? Promise.reject(response.error)
          : Promise.resolve(response.data)
      return { unwrap: () => request.finally(() => setLoading(false)) }
    },
    { isLoading }
  ]
}

export const applicationsGroupApi = {
  useGetAllApplicationsGroupQuery: (args, options) =>
    query('groups', fixtures().applicationGroups, args, options),
  useCreateApplicationsGroupMutation: () => useMutation('createGroup'),
  useUpdateApplicationsGroupMutation: () => useMutation('updateGroup'),
  useRemoveApplicationsGroupMutation: () => useMutation('deleteGroup')
}

export const applicationsApi = {
  useGetAllApplicationsServiceQuery: () =>
    query('allApps', fixtures().applications),
  useApplicationsGetAllQuery: (args, options) =>
    query('allApps', fixtures().applications, args, options),
  useGetApplicationsByAppGroupQuery: (args) =>
    query(
      'groupApps',
      fixtures().applications.filter(
        (app) => app.applicationGroupId === args.id
      ),
      args
    ),
  useCreateApplicationServiceMutation: () => useMutation('createApp'),
  useUpdateApplicationsServiceMutation: () => useMutation('updateApp'),
  useRemoveApplicationsServiceMutation: () => useMutation('deleteApp'),
  useGetNextAppIdMutation: () => useMutation('nextAppId'),
  useGetApplicationGetApplicationByTokenMutation: () =>
    useMutation('searchToken'),
  util: { invalidateTags: () => ({ type: 'TEST' }) }
}

export const tokensApi = {
  useGetTokensByAppIdQuery: (args, options) =>
    query('tokens', fixtures().tokens[args.id] ?? [], args, options),
  useCreateTokenMutation: () => useMutation('createToken'),
  useRevokeTokensMutation: () => useMutation('revokeToken')
}
