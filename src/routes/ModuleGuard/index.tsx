import { Button, Result, Spin } from 'antd'
import { ReactNode, useMemo } from 'react'

import { localStorageKeys } from '@constants/localStorageKeys'

import { LocalStorage } from '@utils/localStorageUtils'

import modulesServiceApi from '@services/modulesService'

import './module-guard.scss'

export type ModuleGuardFallbackType =
  | ReactNode
  | ((props: { missingModules: string[] }) => ReactNode)

export interface ModuleGuardPropsType {
  requiredModules?: string[]
  fallback?: ModuleGuardFallbackType
  children: ReactNode
}

const DefaultModuleFallback = ({
  missingModules
}: {
  missingModules: string[]
}) => (
  <div className="module-guard__fallback">
    <Result
      status="403"
      title="Недостаточно модулей"
      subTitle="Для доступа к странице требуются следующие модули:"
    >
      <ul>
        {missingModules.map((moduleName) => (
          <li key={moduleName}>{moduleName}</li>
        ))}
      </ul>
    </Result>
  </div>
)

const ModuleGuard = ({
  requiredModules = [],
  fallback,
  children
}: ModuleGuardPropsType) => {
  const userToken = LocalStorage.get(localStorageKeys.USER_TOKEN)

  const {
    data: modules,
    isUninitialized,
    isLoading,
    isError,
    isFetching,
    refetch
  } = modulesServiceApi.useGetModulesQuery('modules', { skip: !userToken })

  const missingModules = useMemo(() => {
    if (requiredModules.length === 0) {
      return []
    }

    const availableModules = new Set(
      (modules || []).filter((item) => item.active).map((item) => item.name)
    )

    return requiredModules.filter(
      (moduleName) => !availableModules.has(moduleName)
    )
  }, [requiredModules, modules])

  const isModulesPending = !!userToken && (isUninitialized || isLoading)

  if (isModulesPending) {
    return <Spin size="large" fullscreen />
  }

  if (isError) {
    return (
      <div className="module-guard__fallback">
        <Result
          className="module-guard__fallback__error"
          status="error"
          title="Не удалось загрузить список модулей"
          subTitle="Проверить доступность раздела не удалось. Попробуйте ещё раз."
        >
          <div className="module-guard__fallback__error__btn">
            <Button
              type="primary"
              disabled={isFetching}
              onClick={() => refetch()}
            >
              Повторить
            </Button>
          </div>
        </Result>
      </div>
    )
  }

  if (missingModules.length > 0) {
    if (typeof fallback === 'function') {
      return <>{fallback({ missingModules })}</>
    }

    if (fallback) {
      return <>{fallback}</>
    }

    return <DefaultModuleFallback missingModules={missingModules} />
  }

  return <>{children}</>
}

export default ModuleGuard
