import { Spin, Table, Tag, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { memo, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { dateFormats } from '@constants/date.ts'

import {
  AddressType,
  EndpointType,
  ModuleStatusType,
  ModuleType
} from '@pages/ModulesPage/module.type.ts'

import useRole from '@hooks/useRole.tsx'

import modulesServiceApi from '@services/modulesService.ts'

import { routePaths } from '@routes/routePaths.ts'

import { PermissionKeysType } from '@type/roles.type.ts'

import './connections.scss'

const Connections = () => {
  const { data: ConnectionsList = [], isLoading: isModulesLoading } =
    modulesServiceApi.useGetModulesQuery('modules')
  const { role, hasPermission } = useRole()
  const navigate = useNavigate()
  const { id } = useParams()
  const [obj, setObj] = useState<ModuleStatusType[] | []>([])

  const isLoading = isModulesLoading
  const isPageAvailable = hasPermission(PermissionKeysType.read)

  useEffect(() => {
    const filterId = ConnectionsList.find((item: ModuleType) => item.id === id)
    if (filterId && filterId.status) {
      setObj(filterId.status)
    }
  }, [ConnectionsList, id])

  useEffect(() => {
    if (!isPageAvailable) {
      navigate(routePaths.home)
    }
  }, [isPageAvailable])
  useEffect(() => {
    if (!role) {
      navigate(routePaths.error)
    }
  }, [role])

  if (isLoading) {
    return <Spin />
  }

  const formatFullDate = (obj: string) =>
    dayjs(obj).format(dateFormats.fullFormat)

  const renderEndpoints = ({ endpoints }: ModuleStatusType) => {
    if (endpoints && endpoints.length) {
      return (
        <ul className="connection-page__endpoint-list">
          {endpoints.map(({ path, inner }) => (
            <li className="connection-page__endpoint-list__item" key={path}>
              {path}
              {inner && (
                <Tag
                  className="connection-page__inner-tag"
                  color="processing"
                  bordered={false}
                >
                  Внутренний
                </Tag>
              )}
            </li>
          ))}
        </ul>
      )
    }

    return (
      <div className="connection-page__no-data">Нет реализованных методов</div>
    )
  }

  const columns: ColumnsType = [
    {
      title: '#',
      dataIndex: '',
      key: 'num',
      render: (
        _val: ModuleStatusType,
        _record: ModuleStatusType,
        index: number
      ) => index + 1
    },
    {
      title: 'Версия',
      dataIndex: 'version',
      key: 'version'
    },
    {
      title: 'Версия библиотеки',
      dataIndex: 'libVersion',
      key: 'libVersion'
    },
    {
      title: 'Адрес',
      dataIndex: 'address',
      key: 'address',
      render: (value: AddressType) => `${value.ip}:${value.port}`
    },
    {
      title: 'Соединение установлено',
      dataIndex: 'establishedAt',
      key: 'establishedAt',
      render: (val: string) => {
        dayjs.extend(relativeTime)

        return (
          <Tooltip title={formatFullDate(val)}>{dayjs(val).fromNow()}</Tooltip>
        )
      }
    },
    {
      title: 'Реализованные методы',
      dataIndex: 'endpoints',
      key: 'endpoints',
      render: (value: EndpointType[]) => (value && value.length) || '0'
    }
  ]

  return (
    <section className="connection-page">
      <div className="connection-page__content">
        <div className="connection-page__content__wrap-table">
          <Table
            rowKey={(record) => record.id}
            pagination={false}
            dataSource={obj}
            columns={columns}
            expandable={{
              expandedRowRender: (i) => renderEndpoints(i)
            }}
          />
        </div>
      </div>
    </section>
  )
}

export default memo(Connections)
