import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, message, Spin, TreeProps } from 'antd'
import { ChangeEvent, FC, memo, useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'

import AccessListTree from '@widgets/AccessListTree'
import SelectedAccessMethod from '@widgets/SelectedAccessMethod'

import { AppAccessContentPropsType } from '@components/AppAccessContent/app-access-content.type.ts'

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
  const [messageApi, contextHolder] = message.useMessage()
  const { hasPermission } = useRole()

  const canWrite = hasPermission(PermissionKeysType.write)

  const {
    data: methods = [],
    isLoading: isMethodsLoading,
    isError: isMethodsError,
    isSuccess: isMethodsSuccess
  } = accessListApi.useGetByIdQuery({ id })
  const [setList] = accessListApi.useSetListMutation()
  const [setOne] = accessListApi.useSetOneMutation()

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
      const sendData = {
        appId: id,
        method: node.key as string,
        value: !node.checked
      }
      setOne(sendData)
        .then(() => {
          openSuccessMessage('Статус метода успешно изменен')
        })
        .catch(() => {
          openErrorMessage('Не удалось изменить статус метода')
        })
      return
    }

    const newCheckedKeys = node.children.map((child) => ({
      method: child.key as string,
      value: !node.checked
    }))
    setListMethods(newCheckedKeys)
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setSearchValue(value.trim().toLowerCase(), setSearchParams, paramPrefix)
  }

  const setListMethods = (methods: AccessListMethodType[]) => {
    setList({
      appId: id,
      methods: methods
    })
      .then(() => {
        openSuccessMessage('Статус методов успешно изменен')
      })
      .catch(() => {
        openErrorMessage('Не удалось изменить статус методов')
      })
  }

  const setAllMethods = (status: boolean) => {
    const methods = createAllMethodList(status)
    setListMethods(methods)
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

  if (isLoading) {
    return <Spin className="spin" />
  }

  if (isError) {
    return <Navigate to={routePaths.error} />
  }
  return (
    <div className="app-access-content">
      {contextHolder}
      <div className="app-access-content__header">
        <Input
          prefix={<SearchOutlined />}
          allowClear
          className="app-access-content__main__tree-search-input"
          value={searchValue}
          placeholder="Найти метод"
          onChange={onChange}
        />
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
        </div>
      </div>
      <div className="app-access-content__main">
        <AccessListTree
          searchValue={searchValue}
          onCheck={onCheck}
          defaultAllRoutes={defaultAllRoutes}
          methods={methods}
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
