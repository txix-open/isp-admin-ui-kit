import { useEffect, useMemo, useState } from 'react'

import { ModuleType } from '@pages/ModulesPage/module.type'

import modulesServiceApi from '@services/modulesService'
import swaggerServiceApi from '@services/swaggerService'

const getSwaggerPath = (modules: ModuleType[], moduleId?: string) => {
  if (!moduleId || !modules.length) {
    return null
  }

  const module = modules.find((item) => item.id === moduleId)

  if (!module) {
    return null
  }

  const swaggerEndpoint = module.status
    ?.flatMap((status) => status.endpoints)
    ?.find((endpoint) => endpoint?.path?.includes('swagger'))

  return swaggerEndpoint ? `/${swaggerEndpoint.path}` : null
}

const parseSwaggerSpec = (swaggerSpec?: string) => {
  if (!swaggerSpec) {
    return null
  }

  try {
    return typeof swaggerSpec === 'string'
      ? JSON.parse(swaggerSpec)
      : swaggerSpec
  } catch {
    return null
  }
}

export const useSwaggerSpec = (moduleId?: string) => {
  const {
    data: modules = [],
    isLoading: isModulesLoading,
    isFetching: isModulesFetching
  } = modulesServiceApi.useGetModulesQuery('modules')

  const [swaggerPath, setSwaggerPath] = useState<string | null>()

  useEffect(() => {
    if (isModulesLoading || isModulesFetching) {
      return
    }

    setSwaggerPath(getSwaggerPath(modules, moduleId))
  }, [modules, moduleId, isModulesLoading, isModulesFetching])

  const {
    data: swaggerSpec,
    isLoading: isSwaggerLoading,
    isFetching: isSwaggerFetching
  } = swaggerServiceApi.useGetSwaggerQuery(swaggerPath || '', {
    skip: !swaggerPath
  })

  const parsedSpec = useMemo(
    () => parseSwaggerSpec(swaggerSpec),
    [swaggerSpec]
  )
  const isResolvingSwaggerPath =
    Boolean(moduleId) &&
    (isModulesLoading || isModulesFetching || swaggerPath === undefined)

  return {
    parsedSpec,
    isLoading: isResolvingSwaggerPath || isSwaggerLoading || isSwaggerFetching
  }
}
