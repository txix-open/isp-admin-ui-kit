import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, message, Spin, TreeProps } from 'antd'
import { ChangeEvent, FC, memo, useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'

import AccessListTree from '@widgets/AccessListTree'
import SelectedAccessMethod from '@widgets/SelectedAccessMethod'

import { AppAccessContentPropsType } from '@components/AppAccessContent/app-access-content.type.ts'
import SaveModal from '@components/SaveModal/SaveModal'

import { setSearchValue } from '@utils/columnLayoutUtils.ts'

import useRole from '@hooks/useRole.tsx'

import accessListApi from '@services/accessListService.ts'
import routeApi from '@services/routeService.ts'

import { routePaths } from '@routes/routePaths.ts'

import { AccessListMethodType, EndpointType } from '@type/accessList.type.ts'
import { PermissionKeysType } from '@type/roles.type.ts'

import './app-access-content.scss'

const unknownMethodKey = 'неизвестные методы'

const AppAccessContent: FC<AppAccessContentPropsType> = ({
  id,
  paramPrefix
}) => {
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false)
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
  const { moduleEndpoints, allRouteMap } = routes
  const [defaultAllRoutes, setDefaultAllRoutes] = useState<
    Record<string, EndpointType[]>
  >({})
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
    return Object.keys(allRouteMap).map((key) => {
      return {
        method: key,
        value: status
      }
    })
  }

  const onCheck: TreeProps['onCheck'] = (_, info): void | never[] => {
    const { node } = info
    if (!node.children) {
      setSelectedMethod((prev) => [
        ...prev.filter((item) => item.method !== node.key),
        { method: node.key as string, value: !node.checked }
      ])
      return
    }

    const newChanges = node.children.map((child) => ({
      method: child.key as string,
      value: !node.checked
    }))

    setSelectedMethod((prev) => [
      ...prev.filter(
        (item) => !node.children?.some((child) => child.key === item.method)
      ),
      ...newChanges
    ])
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setSearchValue(value.trim().toLowerCase(), setSearchParams, paramPrefix)
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
        setSelectedMethod([])
        setShowSaveModal(false)
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

  const getAllRoutes = () => {
    const missingRoute: EndpointType[] = []
    const copyAllRoutes = { ...moduleEndpoints }

    methods.forEach((item) => {
      if (!allRouteMap[item.method]) {
        missingRoute.push({ path: item.method } as EndpointType)
      }
    })

    if (missingRoute.length) {
      copyAllRoutes[unknownMethodKey] = missingRoute
    }
    return copyAllRoutes
  }

  useEffect(() => {
    const allRoutes = getAllRoutes()
    setDefaultAllRoutes(allRoutes)
  }, [isSuccess])

  const currentMethodStatus = methods.reduce(
    (acc, method) => {
      acc[method.method] = method.value
      return acc
    },
    {} as Record<string, boolean>
  )

  const changes = {
    allowed: selectedMethod
      .filter((method) => method.value && !currentMethodStatus[method.method])
      .map((method) => method.method),
    denied: selectedMethod
      .filter((method) => !method.value && currentMethodStatus[method.method])
      .map((method) => method.method)
  }

  const isNoChanges =
    changes.allowed.length === 0 && changes.denied.length === 0

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
      <div className="app-access-content__header">
        <Input
          prefix={<SearchOutlined />}
          allowClear
          className="app-access-content__main__tree-search-input"
          value={searchValue}
          placeholder="Найти метод"
          onChange={onChange}
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
      <div className="app-access-content__main">
        <AccessListTree
          searchValue={searchValue}
          onCheck={onCheck}
          defaultAllRoutes={defaultAllRoutes}
          methods={methods}
          selectedMethod={selectedMethod}
        />
        <SelectedAccessMethod
          unknownMethodKey={unknownMethodKey}
          methods={methods}
          allRoutes={defaultAllRoutes}
        />
      </div>
    </div>
  )
}

export default memo(AppAccessContent)
