import { SearchOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Input,
  message,
  Progress,
  Segmented,
  Space,
  Spin,
  Statistic,
  Tag,
  TreeProps
} from 'antd'
import { ChangeEvent, FC, memo, useEffect, useMemo, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'

import AccessListTree from '@widgets/AccessListTree'
import SelectedAccessMethod from '@widgets/SelectedAccessMethod'

import { AppAccessContentPropsType } from '@components/AppAccessContent/app-access-content.type'
import SaveModal from '@components/SaveModal/SaveModal'

import { setUrlValue } from '@utils/columnLayoutUtils'

import useRole from '@hooks/useRole'

import accessListApi from '@services/accessListService'
import routeApi from '@services/routeService'

import { routePaths } from '@routes/routePaths'

import {
  AccessListDeleteListRequestType,
  AccessListMethodType,
  BaseEndpoint,
  EndpointType
} from '@type/accessList.type'
import { PermissionKeysType } from '@type/roles.type'

import './app-access-content.scss'

const unknownMethodKey = 'неизвестные методы'
type AccessViewModeType = 'all' | 'changed'
const getMethodKey = (method: string, httpMethod?: string) =>
  `${httpMethod || ''}_${method}`

const AppAccessContent: FC<AppAccessContentPropsType> = ({
  id,
  paramPrefix
}) => {
  const { CheckableTag } = Tag
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false)
  const [selectedHttpMethods, setSelectedHttpMethods] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<AccessViewModeType>('all')
  const [isModeTransition, setIsModeTransition] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const { hasPermission } = useRole()

  const canWrite = hasPermission(PermissionKeysType.app_access_edit)

  const {
    data: methods = [],
    isLoading: isMethodsLoading,
    isError: isMethodsError,
    isSuccess: isMethodsSuccess
  } = accessListApi.useGetByIdQuery({ id })
  const [setList] = accessListApi.useSetListMutation()
  const [deleteList] = accessListApi.useDeleteListMutation()

  const {
    data: routes = {
      originalResponse: [],
      moduleEndpoints: {},
      allRouteMap: {}
    },
    isLoading: isRouteLoading,
    isError: isRouteError,
    isSuccess: isRouteSuccess
  } = routeApi.useGetAllRoutesQuery()
  const { moduleEndpoints } = routes
  const [selectedMethod, setSelectedMethod] = useState<AccessListMethodType[]>(
    []
  )

  const [searchParams, setSearchParams] = useSearchParams()
  const searchValue = searchParams.get(paramPrefix) || ''

  const isLoading = isMethodsLoading || isRouteLoading
  const isError = isMethodsError || isRouteError
  const isSuccess = isMethodsSuccess && isRouteSuccess

  const openSuccessMessage = (body: string) => {
    messageApi.success(body)
  }

  const openErrorMessage = (body: string) => {
    messageApi.error(body)
  }

  const createAllMethodList = (status: boolean) => {
    return Object.values(moduleEndpoints)
      .flat()
      .map((key) => {
        return {
          method: key.path,
          value: status,
          httpMethod: key.httpMethod
        }
      })
  }

  const handleOnCheck: TreeProps['onCheck'] = (_, info): void | never[] => {
    const node = info.node as any

    if (!node.children) {
      setSelectedMethod((prev) => {
        const newValue = !node.checked

        const currentMethod = methods.find(
          (m) => m.method === node.path && m.httpMethod === node.httpMethod
        )
        const currentValue = currentMethod?.value ?? false

        if (currentValue === newValue) {
          return prev.filter(
            (item) =>
              !(
                item.method === node.path && item.httpMethod === node.httpMethod
              )
          )
        }

        const filtered = prev.filter(
          (item) =>
            !(item.method === node.path && item.httpMethod === node.httpMethod)
        )
        return [
          ...filtered,
          {
            method: node.path,
            httpMethod: node.httpMethod,
            value: newValue
          }
        ]
      })
      return
    }

    const newChanges = node.children.map((child: any) => ({
      method: child.path,
      httpMethod: child.httpMethod,
      value: !node.checked
    }))

    setSelectedMethod((prev) => {
      const filtered = prev.filter(
        (item) =>
          !node.children?.some(
            (child: any) =>
              child.path === item.method && child.httpMethod === item.httpMethod
          )
      )

      const validChanges = newChanges.filter((change: any) => {
        const currentMethod = methods.find(
          (m) =>
            m.method === change.method && m.httpMethod === change.httpMethod
        )
        const currentValue = currentMethod?.value ?? false
        return currentValue !== change.value
      })

      return [...filtered, ...validChanges]
    })
  }

  const handleInputOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setUrlValue(value.trim().toLowerCase(), setSearchParams, paramPrefix)
  }

  const handleRemoveUnknowMethods = (methods: BaseEndpoint[]) => {
    const sendData: AccessListDeleteListRequestType = {
      appId: id,
      methods: methods.map((obj) => ({
        method: obj.path,
        httpMethod: obj.httpMethod
      }))
    }
    deleteList(sendData)
      .unwrap()
      .then(() => {
        openSuccessMessage('Методы успешно удалены')
      })
      .catch(() => {
        openErrorMessage('Не удалось удалить методы')
      })
  }

  const saveChanges = () => {
    if (selectedMethod.length === 0) {
      openSuccessMessage('Нет изменений для сохранения')
      return
    }
    setList({
      appId: id,
      methods: selectedMethod
    })
      .then(() => {
        openSuccessMessage('Статус методов успешно изменен')
        setShowSaveModal(false)
        setSelectedMethod([])
      })
      .catch(() => {
        openErrorMessage('Не удалось изменить статус методов')
        setShowSaveModal(false)
      })
  }

  const setAllMethods = (status: boolean) => {
    const methods = createAllMethodList(status)
    setSelectedMethod(methods)
  }

  const defaultAllRoutes = useMemo(() => {
    const missingRoute: EndpointType[] = []
    const copyAllRoutes = { ...moduleEndpoints }

    const allRoutesArray = Object.values(moduleEndpoints).flat()

    methods.forEach((item) => {
      const hasRoute = allRoutesArray.some(
        (route) =>
          route.path === item.method && route.httpMethod === item.httpMethod
      )

      if (!hasRoute) {
        missingRoute.push({
          path: item.method,
          httpMethod: item.httpMethod
        } as EndpointType)
      }
    })

    if (missingRoute.length) {
      copyAllRoutes[unknownMethodKey] = missingRoute
    }
    return copyAllRoutes
  }, [isSuccess, moduleEndpoints, methods])

  const currentMethodStatus = useMemo(
    () =>
      methods.reduce(
        (acc, method) => {
          const key = getMethodKey(method.method, method.httpMethod)
          acc[key] = method.value
          return acc
        },
        {} as Record<string, boolean>
      ),
    [methods]
  )

  const selectedMethodStatusMap = useMemo(
    () =>
      selectedMethod.reduce(
        (acc, method) => {
          const key = getMethodKey(method.method, method.httpMethod)
          acc[key] = method.value
          return acc
        },
        {} as Record<string, boolean>
      ),
    [selectedMethod]
  )

  const changes = {
    allowed: selectedMethod
      .filter((method) => {
        const key = getMethodKey(method.method, method.httpMethod)
        return method.value && !currentMethodStatus[key]
      })
      .map((method) => `${method.httpMethod} ${method.method}`),

    denied: selectedMethod
      .filter((method) => {
        const key = getMethodKey(method.method, method.httpMethod)
        return !method.value && currentMethodStatus[key]
      })
      .map((method) => `${method.httpMethod} ${method.method}`)
  }

  const isNoChanges =
    changes.allowed.length === 0 && changes.denied.length === 0

  const allRouteEndpoints = useMemo(
    () => Object.values(defaultAllRoutes).flat(),
    [defaultAllRoutes]
  )

  const totalMethodsCount = useMemo(
    () =>
      new Set(
        allRouteEndpoints.map((endpoint) =>
          getMethodKey(endpoint.path, endpoint.httpMethod)
        )
      ).size,
    [allRouteEndpoints]
  )

  const allowedMethodsCount = useMemo(() => {
    const keys = new Set<string>([
      ...allRouteEndpoints.map((endpoint) =>
        getMethodKey(endpoint.path, endpoint.httpMethod)
      ),
      ...methods.map((method) =>
        getMethodKey(method.method, method.httpMethod)
      ),
      ...selectedMethod.map((method) =>
        getMethodKey(method.method, method.httpMethod)
      )
    ])

    let count = 0
    keys.forEach((key) => {
      const value =
        key in selectedMethodStatusMap
          ? selectedMethodStatusMap[key]
          : currentMethodStatus[key]
      if (value) {
        count += 1
      }
    })

    return count
  }, [
    allRouteEndpoints,
    methods,
    selectedMethod,
    selectedMethodStatusMap,
    currentMethodStatus
  ])

  const changedMethodsCount = changes.allowed.length + changes.denied.length
  const unknownMethodsCount = defaultAllRoutes[unknownMethodKey]?.length || 0
  const allowedPercent = totalMethodsCount
    ? Math.round((allowedMethodsCount / totalMethodsCount) * 100)
    : 0
  const uniqueHttpMethods = useMemo(
    () =>
      Array.from(
        new Set(
          Object.values(defaultAllRoutes)
            .flat()
            .map((endpoint) => endpoint.httpMethod)
        )
      ).sort(),
    [defaultAllRoutes]
  )

  useEffect(() => {
    setIsModeTransition(true)
    const timer = setTimeout(() => {
      setIsModeTransition(false)
    }, 180)

    return () => clearTimeout(timer)
  }, [viewMode])

  if (isLoading) {
    return <Spin className="spin" />
  }

  if (isError) {
    return <Navigate to={routePaths.error} />
  }
  return (
    <div className="app-access-content">
      {contextHolder}
      {showSaveModal && (
        <SaveModal
          onOk={saveChanges}
          open={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          changes={changes}
        />
      )}
      <div className="app-access-content__toolbar">
        <div className="app-access-content__header">
          <Input
            prefix={<SearchOutlined />}
            allowClear
            className="app-access-content__main__tree-search-input"
            value={searchValue}
            placeholder="Найти метод"
            onChange={handleInputOnChange}
          />
          <Segmented
            className="app-access-content__view-mode"
            value={viewMode}
            options={[
              {
                label: (
                  <span className="app-access-content__view-mode-label">
                    Все
                  </span>
                ),
                value: 'all'
              },
              {
                label: (
                  <span className="app-access-content__view-mode-label">
                    Только изменённые
                  </span>
                ),
                value: 'changed'
              }
            ]}
            onChange={(value) => setViewMode(value as AccessViewModeType)}
          />
          {canWrite && (
            <div className="app-access-content__header__action-buttons">
              <Button
                disabled={!canWrite}
                onClick={() => {
                  setAllMethods(false)
                }}
              >
                Запретить все
              </Button>
              <Button
                disabled={!canWrite}
                onClick={() => {
                  setAllMethods(true)
                }}
              >
                Выбрать все
              </Button>
              <Button
                type="primary"
                disabled={isNoChanges}
                onClick={() => {
                  setShowSaveModal(true)
                }}
              >
                Сохранить
              </Button>
            </div>
          )}
        </div>
        <div className="app-access-content__http-filters">
          {uniqueHttpMethods.map((method) => (
            <CheckableTag
              key={method}
              checked={selectedHttpMethods.includes(method)}
              onChange={(checked) => {
                setSelectedHttpMethods((prev) =>
                  checked ? [...prev, method] : prev.filter((m) => m !== method)
                )
              }}
            >
              {method}
            </CheckableTag>
          ))}
          {selectedHttpMethods.length > 0 && (
            <Button
              type="link"
              size="small"
              onClick={() => setSelectedHttpMethods([])}
            >
              Сбросить фильтры
            </Button>
          )}
        </div>
      </div>
      <Space className="app-access-content__stats" size={16} wrap>
        <Card
          size="small"
          className="app-access-content__stats-card app-access-content__stats-card--progress"
        >
          <div className="app-access-content__stats-progress-title">
            Разрешено {allowedMethodsCount}/{totalMethodsCount}
          </div>
          <Progress percent={allowedPercent} size="small" showInfo={false} />
        </Card>
        <Card size="small" className="app-access-content__stats-card">
          <Statistic title="Всего методов" value={totalMethodsCount} />
        </Card>
        <Card size="small" className="app-access-content__stats-card">
          <Statistic title="Изменено" value={changedMethodsCount} />
        </Card>
        {unknownMethodsCount > 0 && (
          <Card size="small" className="app-access-content__stats-card">
            <Statistic title="Неизвестные" value={unknownMethodsCount} />
          </Card>
        )}
      </Space>
      <div
        className={`app-access-content__main ${isModeTransition ? 'app-access-content__main--mode-transition' : ''}`}
      >
        <Card className="app-access-content__panel" title="Дерево маршрутов">
          <AccessListTree
            searchValue={searchValue}
            onCheck={handleOnCheck}
            defaultAllRoutes={defaultAllRoutes}
            methods={methods}
            selectedMethod={selectedMethod}
            selectedHttpMethods={selectedHttpMethods}
            showChangedOnly={viewMode === 'changed'}
            onRemoveUnknownMethods={canWrite && handleRemoveUnknowMethods}
          />
        </Card>
        <Card
          className="app-access-content__panel"
          title={`Разрешенные методы (${allowedMethodsCount})`}
        >
          <SelectedAccessMethod
            unknownMethodKey={unknownMethodKey}
            methods={methods}
            selectedMethod={selectedMethod}
            allRoutes={defaultAllRoutes}
          />
        </Card>
      </div>
    </div>
  )
}

export default memo(AppAccessContent)
