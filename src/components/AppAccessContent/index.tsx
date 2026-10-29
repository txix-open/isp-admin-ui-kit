import {
  CheckCircleOutlined,
  DownOutlined,
  EditOutlined,
  EllipsisOutlined,
  FilterOutlined,
  WarningOutlined,
  ClearOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
  UndoOutlined
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Dropdown,
  Popover,
  Input,
  message,
  Result,
  Segmented,
  Spin,
  Tag,
  Tooltip,
  TreeProps
} from 'antd'
import { ChangeEvent, FC, memo, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import AccessListTree from '@widgets/AccessListTree'
import SelectedAccessMethod from '@widgets/SelectedAccessMethod'

import { AppAccessContentPropsType } from '@components/AppAccessContent/app-access-content.type'
import { PageHeader } from '@components/PageLayout'
import SaveModal from '@components/SaveModal/SaveModal'

import {
  getHttpMethodLabel,
  matchesAccessRoute
} from '@utils/accessRouteFilters'
import { notifyApiError } from '@utils/apiErrorNotifications'
import { setUrlValue } from '@utils/columnLayoutUtils'

import useRole from '@hooks/useRole'
import useUnsavedChanges from '@hooks/useUnsavedChanges'

import accessListApi from '@services/accessListService'
import routeApi from '@services/routeService'

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
  paramPrefix,
  name
}) => {
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false)
  const [selectedHttpMethods, setSelectedHttpMethods] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<AccessViewModeType>('all')
  const [activePanel, setActivePanel] = useState('routes')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const { hasPermission } = useRole()

  const canWrite = hasPermission(PermissionKeysType.app_access_edit)

  const canRead = hasPermission(PermissionKeysType.app_access_view)
  const validId = Number.isSafeInteger(id) && id >= 0
  const methodsQuery = accessListApi.useGetByIdQuery(
    { id },
    { skip: !canRead || !validId }
  )
  const methods = methodsQuery.data ?? []
  const [setList, { isLoading: isSavingAccess }] =
    accessListApi.useSetListMutation()
  const [deleteList, { isLoading: isDeletingAccess }] =
    accessListApi.useDeleteListMutation()
  const routesQuery = routeApi.useGetAllRoutesQuery(undefined, {
    skip: !canRead || !validId
  })
  const moduleEndpoints = routesQuery.data?.moduleEndpoints ?? {}
  const busy = isSavingAccess || isDeletingAccess
  const hasData =
    methodsQuery.data !== undefined && routesQuery.data !== undefined
  const [selectedMethod, setSelectedMethod] = useState<AccessListMethodType[]>(
    []
  )

  const [searchParams, setSearchParams] = useSearchParams()
  const searchValue = searchParams.get(paramPrefix) || ''

  const isLoading =
    !hasData &&
    (methodsQuery.isLoading ||
      methodsQuery.isFetching ||
      routesQuery.isLoading ||
      routesQuery.isFetching)
  const isError = methodsQuery.isError || routesQuery.isError
  const isFetching = methodsQuery.isFetching || routesQuery.isFetching
  const refetch = () => {
    void methodsQuery.refetch()
    void routesQuery.refetch()
  }

  const openSuccessMessage = (body: string) => {
    messageApi.success(body)
  }

  const handleOnCheck: TreeProps['onCheck'] = (_, info) => {
    if (!canWrite || busy) return
    const node = info.node as any
    const targets = (node.children ?? [node]).filter((child: any) => {
      const key = getMethodKey(child.path, child.httpMethod)
      const changed =
        key in selectedMethodStatusMap &&
        selectedMethodStatusMap[key] !== (currentMethodStatus[key] ?? false)
      return (
        matchesAccessRoute(child, searchValue, selectedHttpMethods) &&
        (viewMode !== 'changed' || changed)
      )
    })
    const targetKeys = new Set(
      targets.map((child: any) => getMethodKey(child.path, child.httpMethod))
    )
    const updates = targets
      .map((child: any) => ({
        method: child.path,
        httpMethod: child.httpMethod,
        value: info.checked
      }))
      .filter(
        (change: AccessListMethodType) =>
          (currentMethodStatus[
            getMethodKey(change.method, change.httpMethod)
          ] ?? false) !== change.value
      )
    setSelectedMethod((previous) => [
      ...previous.filter(
        (method) =>
          !targetKeys.has(getMethodKey(method.method, method.httpMethod))
      ),
      ...updates
    ])
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
    if (!canWrite || busy) return
    return deleteList(sendData)
      .unwrap()
      .then(() => {
        const removed = new Set(
          methods.map((method) => getMethodKey(method.path, method.httpMethod))
        )
        setSelectedMethod((previous) =>
          previous.filter(
            (method) =>
              !removed.has(getMethodKey(method.method, method.httpMethod))
          )
        )
        openSuccessMessage('Неизвестные методы удалены')
      })
      .catch((error) => {
        notifyApiError(error, 'Не удалось удалить методы')
      })
  }

  const saveChanges = () => {
    if (!canWrite || busy) return
    if (pendingChanges.length === 0) {
      openSuccessMessage('Нет изменений для сохранения')
      return
    }
    return setList({
      appId: id,
      methods: pendingChanges
    })
      .unwrap()
      .then(() => {
        draftGuard.markSaved()
        openSuccessMessage('Статус методов успешно изменен')
        setShowSaveModal(false)
        setSelectedMethod([])
      })
      .catch((error) => {
        notifyApiError(error, 'Не удалось изменить статус методов')
      })
  }

  const setAllMethods = (value: boolean) => {
    if (!canWrite || busy) return
    const targets = new Map(
      Object.values(moduleEndpoints)
        .flat()
        .map((endpoint) => [
          getMethodKey(endpoint.path, endpoint.httpMethod),
          endpoint
        ])
    )
    const updates = Array.from(targets.values(), (endpoint) => ({
      method: endpoint.path,
      httpMethod: endpoint.httpMethod,
      value
    })).filter(
      (method) =>
        (currentMethodStatus[getMethodKey(method.method, method.httpMethod)] ??
          false) !== value
    )
    setSelectedMethod((previous) => [
      ...previous.filter(
        (method) => !targets.has(getMethodKey(method.method, method.httpMethod))
      ),
      ...updates
    ])
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
  }, [moduleEndpoints, methods])

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

  const pendingChanges = selectedMethod.filter(
    (method) =>
      method.value !==
      (currentMethodStatus[getMethodKey(method.method, method.httpMethod)] ??
        false)
  )

  const changes = {
    allowed: selectedMethod
      .filter((method) => {
        const key = getMethodKey(method.method, method.httpMethod)
        return method.value && !currentMethodStatus[key]
      })
      .map(
        (method) => `${getHttpMethodLabel(method.httpMethod)} ${method.method}`
      ),

    denied: selectedMethod
      .filter((method) => {
        const key = getMethodKey(method.method, method.httpMethod)
        return !method.value && currentMethodStatus[key]
      })
      .map(
        (method) => `${getHttpMethodLabel(method.httpMethod)} ${method.method}`
      )
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
  const uniqueHttpMethods = useMemo(
    () =>
      Array.from(
        new Set(
          Object.values(defaultAllRoutes)
            .flat()
            .map((endpoint) => endpoint.httpMethod?.trim() || '')
        )
      ).sort(),
    [defaultAllRoutes]
  )

  const draftGuard = useUnsavedChanges({
    dirty: canWrite && !isNoChanges,
    busy: isSavingAccess,
    label: `Права приложения «${name || `#${id}`}»`
  })

  if (!canRead)
    return <Result status="403" title="Нет доступа к правам приложения" />
  if (!validId)
    return <Result status="404" title="Некорректный идентификатор приложения" />
  if (isLoading)
    return (
      <div className="app-access-content__state" role="status">
        <Spin />
        Загрузка прав и маршрутов…
      </div>
    )
  if (!hasData)
    return (
      <Result
        status="error"
        title="Не удалось загрузить права приложения"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={refetch}
            loading={isFetching}
          >
            Повторить
          </Button>
        }
      />
    )

  const hasFilters = Boolean(
    searchValue || selectedHttpMethods.length || viewMode === 'changed'
  )
  const clearFilters = () => {
    setSelectedHttpMethods([])
    setViewMode('all')
    setUrlValue('', setSearchParams, paramPrefix)
  }
  const knownCount = Object.values(moduleEndpoints).reduce(
    (count, endpoints) => count + endpoints.length,
    0
  )

  const renderViewMode = () => (
    <Segmented
      aria-label="Отображение методов"
      value={viewMode}
      options={[
        { label: 'Все методы', value: 'all' },
        { label: 'Изменённые', value: 'changed' }
      ]}
      onChange={(value) => setViewMode(value as AccessViewModeType)}
    />
  )
  const renderMethodFilters = () => (
    <div
      className="app-access-content__http-filters"
      role="group"
      aria-label="HTTP-методы"
    >
      {uniqueHttpMethods.map((method) => (
        <Button
          key={method}
          aria-pressed={selectedHttpMethods.includes(method)}
          type={selectedHttpMethods.includes(method) ? 'primary' : 'default'}
          onClick={() =>
            setSelectedHttpMethods((previous) =>
              previous.includes(method)
                ? previous.filter((item) => item !== method)
                : [...previous, method]
            )
          }
        >
          {getHttpMethodLabel(method)}
        </Button>
      ))}
      <Button
        icon={<ClearOutlined />}
        disabled={!hasFilters}
        onClick={clearFilters}
      >
        Сбросить фильтры
      </Button>
    </div>
  )

  return (
    <section className="app-access-content" aria-label="Права приложения">
      {contextHolder}
      {showSaveModal && (
        <SaveModal
          onOk={saveChanges}
          open
          onClose={() => setShowSaveModal(false)}
          loading={isSavingAccess}
          changes={changes}
        />
      )}
      <PageHeader
        level={2}
        focusOnMount
        title={name || `Приложение #${id}`}
        context={`ID ${id} · Доступ к методам`}
        actions={
          <>
            <span
              className="app-access-content__secondary-actions"
              data-editable={canWrite}
            >
              <Button
                icon={<ReloadOutlined />}
                loading={isFetching}
                disabled={busy}
                onClick={refetch}
              >
                Обновить
              </Button>
              {canWrite && (
                <Button
                  icon={<UndoOutlined />}
                  disabled={busy || isNoChanges}
                  onClick={() => setSelectedMethod([])}
                >
                  Отменить изменения
                </Button>
              )}
            </span>
            {canWrite && (
              <>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  disabled={busy || isNoChanges}
                  loading={isSavingAccess}
                  onClick={() => setShowSaveModal(true)}
                >
                  Сохранить изменения
                </Button>
              </>
            )}
            {canWrite && (
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'refresh',
                      label: 'Обновить',
                      icon: <ReloadOutlined />,
                      disabled: busy || isFetching,
                      onClick: refetch
                    },
                    {
                      key: 'undo',
                      label: 'Отменить изменения',
                      icon: <UndoOutlined />,
                      disabled: busy || isNoChanges,
                      onClick: () => setSelectedMethod([])
                    }
                  ]
                }}
              >
                <Button
                  className="app-access-content__mobile-only"
                  aria-label="Другие действия с правами"
                  icon={<EllipsisOutlined />}
                />
              </Dropdown>
            )}
          </>
        }
      />
      <div className="app-access-content__workspace">
        {isError && (
          <Alert
            type="warning"
            showIcon
            title="Не удалось обновить данные. Черновик сохранён в форме."
            action={
              <Button onClick={refetch} loading={isFetching}>
                Повторить
              </Button>
            }
          />
        )}
        <div className="app-access-content__toolbar">
          <div className="app-access-content__filters">
            <Input
              prefix={<SearchOutlined />}
              allowClear
              aria-label="Найти метод"
              value={searchValue}
              placeholder="Путь или HTTP-метод"
              onChange={handleInputOnChange}
            />
            <div className="app-access-content__desktop-view-mode">
              {renderViewMode()}
            </div>
            <Popover
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              trigger="click"
              placement="bottomRight"
              title="Фильтры методов"
              content={
                <div
                  className="app-access-content__filter-popup"
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.stopPropagation()
                      setFiltersOpen(false)
                    }
                  }}
                >
                  {renderViewMode()}
                  {renderMethodFilters()}
                </div>
              }
            >
              <Button
                className="app-access-content__mobile-only"
                icon={<FilterOutlined />}
                type={hasFilters ? 'primary' : 'default'}
                aria-label="Фильтры методов"
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setFiltersOpen(false)
                }}
              >
                Фильтры
              </Button>
            </Popover>
          </div>
          <div className="app-access-content__desktop-filters">
            {renderMethodFilters()}
          </div>
          {canWrite && (
            <div className="app-access-content__bulk">
              <span className="app-access-content__bulk-desktop">
                <Tooltip title="Все опубликованные маршруты, включая скрытые фильтрами. Изменения остаются в черновике до сохранения.">
                  <span>
                    Все маршруты <InfoCircleOutlined />
                  </span>
                </Tooltip>
                <Button
                  disabled={busy || !knownCount}
                  onClick={() => setAllMethods(true)}
                >
                  Разрешить все
                </Button>
                <Button
                  disabled={busy || !knownCount}
                  onClick={() => setAllMethods(false)}
                >
                  Запретить все
                </Button>
              </span>
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'allow',
                      label: 'Разрешить все маршруты',
                      disabled: busy || !knownCount,
                      onClick: () => setAllMethods(true)
                    },
                    {
                      key: 'deny',
                      label: 'Запретить все маршруты',
                      danger: true,
                      disabled: busy || !knownCount,
                      onClick: () => setAllMethods(false)
                    }
                  ]
                }}
              >
                <Button
                  className="app-access-content__mobile-only"
                  disabled={busy || !knownCount}
                  title="Все опубликованные маршруты, включая скрытые фильтрами"
                >
                  Все маршруты <DownOutlined />
                </Button>
              </Dropdown>
            </div>
          )}
        </div>
        <div
          className="app-access-content__summary"
          role="status"
          aria-live="polite"
        >
          <span>
            <CheckCircleOutlined /> Разрешено {allowedMethodsCount} из{' '}
            {totalMethodsCount}
          </span>
          <Tag
            color={changedMethodsCount ? 'processing' : undefined}
            icon={<EditOutlined />}
            title={`Несохранённых изменений: ${changedMethodsCount}`}
          >
            <span className="app-access-content__metric-label">
              Изменений:{' '}
            </span>
            {changedMethodsCount}
          </Tag>
          {unknownMethodsCount > 0 && (
            <Tag
              color="warning"
              icon={<WarningOutlined />}
              title={`Неизвестных маршрутов: ${unknownMethodsCount}`}
            >
              <span className="app-access-content__metric-label">
                Неизвестных:{' '}
              </span>
              {unknownMethodsCount}
            </Tag>
          )}
          {!canWrite && <span>Только просмотр</span>}
        </div>
        <Segmented
          className="app-access-content__panel-tabs"
          aria-label="Рабочая панель"
          value={activePanel}
          options={[
            { label: 'Маршруты', value: 'routes' },
            { label: 'Разрешённые', value: 'result' }
          ]}
          onChange={(value) => setActivePanel(String(value))}
          block
        />
        <div className="app-access-content__main">
          <Card
            className="app-access-content__panel"
            data-active={activePanel === 'routes'}
            title="Маршруты"
            extra={
              <Tooltip title="Выбор группы применяется к видимым методам. Подсветка отмечает несохранённые изменения.">
                <InfoCircleOutlined />
              </Tooltip>
            }
          >
            <AccessListTree
              searchValue={searchValue}
              onCheck={handleOnCheck}
              defaultAllRoutes={defaultAllRoutes}
              methods={methods}
              selectedMethod={selectedMethod}
              selectedHttpMethods={selectedHttpMethods}
              showChangedOnly={viewMode === 'changed'}
              disabled={busy}
              onRemoveUnknownMethods={
                canWrite ? handleRemoveUnknowMethods : undefined
              }
            />
          </Card>
          <Card
            className="app-access-content__panel"
            data-active={activePanel === 'result'}
            title={`Разрешённые методы · ${allowedMethodsCount}`}
            extra={
              <Tooltip title="Результат с учётом несохранённых изменений">
                <InfoCircleOutlined />
              </Tooltip>
            }
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
    </section>
  )
}

export default memo(AppAccessContent)
