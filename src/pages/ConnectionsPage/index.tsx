import { Alert, Button, Empty, Table, Tag } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { memo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { dateFormats } from '@constants/date'

import { PageLoading } from '@components/PageLayout'

import {
  AddressType,
  EndpointType,
  ModuleStatusType,
  ModuleType
} from '@pages/ModulesPage/module.type'

import { httpMethodColors } from '@utils/httpMethodColorUtils'

import useRole from '@hooks/useRole'

import modulesServiceApi from '@services/modulesService'

import { routePaths } from '@routes/routePaths'

import './connections.scss'

dayjs.extend(relativeTime)

const Connections = () => {
  const {
    data: connectionsList = [],
    isLoading: isModulesLoading,
    isError,
    refetch
  } = modulesServiceApi.useGetModulesQuery('modules')
  const { role } = useRole()
  const navigate = useNavigate()
  const { id } = useParams()
  const instances =
    connectionsList.find((item: ModuleType) => String(item.id) === id)
      ?.status ?? []

  const isLoading = isModulesLoading

  useEffect(() => {
    if (!role) {
      navigate(routePaths.error)
    }
  }, [role])

  if (isLoading) {
    return <PageLoading label="Загрузка подключений…" />
  }

  const formatFullDate = (obj: string) =>
    dayjs(obj).format(dateFormats.fullFormat)

  const renderEndpoints = ({ endpoints }: ModuleStatusType) => {
    if (endpoints && endpoints.length) {
      return (
        <ul className="connection-page__endpoint-list">
          {endpoints.map(({ path, httpMethod, inner }, index) => (
            <li
              className="connection-page__endpoint-list__item"
              key={`${httpMethod}:${path}:${index}`}
            >
              {httpMethod && (
                <span className="connection-page__method-tag">
                  <Tag color={httpMethodColors[httpMethod]} variant="filled">
                    {httpMethod}
                  </Tag>
                </span>
              )}
              <code>{path}</code>
              {inner && (
                <Tag
                  className="connection-page__inner-tag"
                  color="processing"
                  variant="filled"
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

  const columns: ColumnsType<ModuleStatusType> = [
    {
      title: '#',
      dataIndex: '',
      key: 'num',
      render: (_value, _record, index: number) => index + 1
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
        return (
          <div className="connection-page__date">
            <span>{dayjs(val).fromNow()}</span>
            <span>{formatFullDate(val)}</span>
          </div>
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
      {isError && (
        <Alert
          type="error"
          showIcon
          title="Не удалось обновить подключения"
          action={<Button onClick={() => refetch()}>Повторить</Button>}
        />
      )}
      {(!isError || instances.length > 0) && (
        <div className="connection-page__content">
          <div className="connection-page__content__wrap-table">
            <Table
              rowKey={(record) => record.id}
              pagination={false}
              dataSource={instances}
              columns={columns}
              scroll={{ x: 820 }}
              locale={{
                emptyText: (
                  <Empty description="У модуля нет подключённых экземпляров" />
                )
              }}
              expandable={{
                expandedRowRender: (i) => renderEndpoints(i),
                rowExpandable: (instance) => Boolean(instance.endpoints?.length)
              }}
            />
          </div>
        </div>
      )}
    </section>
  )
}

export default memo(Connections)
