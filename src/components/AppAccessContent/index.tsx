import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, message, Spin, TreeProps } from 'antd'
import { ChangeEvent, FC, memo, useMemo, useState } from 'react'
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

        if (currentMethod?.value === newValue) {
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
        return currentMethod?.value !== change.value
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

  const currentMethodStatus = methods.reduce(
    (acc, method) => {
      const key = `${method.httpMethod}_${method.method}`
      acc[key] = method.value
      return acc
    },
    {} as Record<string, boolean>
  )

  const changes = {
    allowed: selectedMethod
      .filter((method) => {
        const key = `${method.httpMethod}_${method.method}`
        return method.value && !currentMethodStatus[key]
      })
      .map((method) => `${method.httpMethod} ${method.method}`),

    denied: selectedMethod
      .filter((method) => {
        const key = `${method.httpMethod}_${method.method}`
        return !method.value && currentMethodStatus[key]
      })
      .map((method) => `${method.httpMethod} ${method.method}`)
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
          onChange={handleInputOnChange}
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
          onCheck={handleOnCheck}
          defaultAllRoutes={defaultAllRoutes}
          methods={methods}
          selectedMethod={selectedMethod}
          onRemoveUnknownMethods={canWrite && handleRemoveUnknowMethods}
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
