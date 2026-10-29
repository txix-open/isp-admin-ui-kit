import { useMemo } from 'react'

import modulesServiceApi from '@services/modulesService'
import swaggerServiceApi from '@services/swaggerService'

export interface SwaggerSpec {
  openapi?: string
  swagger?: string
  info?: { title?: string; version?: string }
  paths?: Record<string, Record<string, unknown>>
  [key: string]: unknown
}

const parseSwaggerSpec = (
  value: unknown
): { spec: SwaggerSpec | null; invalid: boolean } => {
  if (value === undefined || value === null || value === '')
    return { spec: null, invalid: false }
  try {
    const spec = typeof value === 'string' ? JSON.parse(value) : value
    if (!spec || typeof spec !== 'object' || Array.isArray(spec))
      return { spec: null, invalid: true }
    return { spec, invalid: false }
  } catch {
    return { spec: null, invalid: true }
  }
}

export const useSwaggerSpec = (moduleId?: string) => {
  const modulesQuery = modulesServiceApi.useGetModulesQuery('modules')
  const module = modulesQuery.data?.find((item) => String(item.id) === moduleId)
  const endpoint = module?.status
    ?.flatMap((status) => status.endpoints ?? [])
    .find((item) => item.path?.includes('swagger'))
  const path = endpoint ? `/${endpoint.path.replace(/^\/+/, '')}` : ''
  const specQuery = swaggerServiceApi.useGetSwaggerQuery(path, { skip: !path })
  const { spec, invalid } = useMemo(
    () => parseSwaggerSpec(specQuery.currentData),
    [specQuery.currentData]
  )
  const isError =
    modulesQuery.isError || (Boolean(path) && specQuery.isError) || invalid
  const refetch = () => {
    if (path) void specQuery.refetch()
    if (!path || modulesQuery.isError) void modulesQuery.refetch()
  }
  return {
    parsedSpec: spec,
    module,
    isLoading:
      modulesQuery.isLoading ||
      (Boolean(path) && !spec && specQuery.isFetching),
    isFetching:
      modulesQuery.isFetching || (Boolean(path) && specQuery.isFetching),
    isError,
    errorTitle: invalid
      ? 'Не удалось прочитать спецификацию'
      : 'Не удалось загрузить документацию API',
    errorDescription: invalid
      ? 'Сервис вернул некорректный JSON. Обновите документацию или проверьте спецификацию модуля.'
      : spec
        ? 'Показана ранее загруженная документация.'
        : 'Повторите загрузку документации.',
    emptyDescription: !module
      ? 'Модуль не найден'
      : !path
        ? 'Модуль не предоставляет Swagger'
        : 'Сервис не вернул спецификацию',
    refetch
  }
}
