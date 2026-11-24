import { LogoutOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Popconfirm,
  Spin,
  Table,
  message,
  Pagination,
  Tooltip
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { dateFormats } from '@constants/date'
import { SessionStatusKeysType, sessionStatuses } from '@constants/statuses'

import { getColumnSearchProps } from '@components/ColumnSearch'
import { highlightSearchMatch } from '@components/ColumnSearch/highlightSearchMatch'
import DownloadCsvButton from '@components/DownloadCsvButton'

import { getUserFullName } from '@utils/userUtils/getFullNameUtil'

import useRole from '@hooks/useRole'
import { useTableSearch } from '@hooks/useTableSearch'

import sessionServiceApi from '@services/sessionService'
import userServiceApi from '@services/userService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'
import { SessionType } from '@type/session.type'

import './sessions-page.scss'

const limit = 10

const SessionsPage = () => {
  const {
    query,
    searchParams,
    currentPage,
    setCurrentPage,
    handleTableChange
  } = useTableSearch<SessionType>(
    ['createdAt', 'expiredAt'],
    ['userId', 'status']
  )
  const { currentData, data, isFetching, isError } =
    sessionServiceApi.useGetAllSessionsQuery({
      limit,
      offset: (currentPage - 1) * limit,
      ...searchParams
    })
  const [revokeSession] = sessionServiceApi.useRevokeSessionMutation()
  const { data: allUsers = [], isLoading: isUsersLoading } =
    userServiceApi.useGetAllUsersQuery()
  const { role, hasPermission } = useRole()
  const navigate = useNavigate()

  const isLoading = isUsersLoading

  const isPageAvailable = hasPermission(PermissionKeysType.session_view)
  const hasRevokePermission = hasPermission(PermissionKeysType.session_revoke)

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

  const handleRevokeSessions = (id: number) => {
    revokeSession(id)
      .unwrap()
      .then(() => message.success('Сессия успешно завершена'))
      .catch(() => message.error('Не удалось завершить сессию'))
  }

  if (isLoading) {
    return <Spin />
  }

  const columns: ColumnsType<SessionType> = [
    {
      title: 'Пользователь',
      dataIndex: 'userId',
      key: 'userId',
      sorter: true,
      ...getColumnSearchProps({
        title: 'Пользователь',
        type: 'select',
        options: allUsers.map((user) => ({
          value: user.id,
          label: getUserFullName(user)
        }))
      }),
      render: (value) => {
        const user = allUsers.find((el) => el.id === value)
        return user && getUserFullName(user)
      }
    },
    {
      title: 'Идентификатор',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      ...getColumnSearchProps({ title: 'Идентификатор', type: 'number' }),
      render: (value: number) => highlightSearchMatch(value, query?.id)
    },
    {
      title: 'Дата начала сессии',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      ...getColumnSearchProps({
        title: 'Дата начала сессии',
        type: 'date',
        showTime: true
      }),
      render: (value) => {
        return dayjs(value).format(dateFormats.fullFormat)
      }
    },
    {
      title: 'Дата окончания сессии',
      dataIndex: 'expiredAt',
      key: 'expiredAt',
      sorter: true,
      ...getColumnSearchProps({
        title: 'Дата окончания сессии',
        type: 'date',
        showTime: true
      }),
      render: (value) => {
        return dayjs(value).format(dateFormats.fullFormat)
      }
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      ...getColumnSearchProps({
        title: 'Статус',
        type: 'select',
        options: Object.entries(sessionStatuses).map(([value, label]) => ({
          value,
          label
        }))
      }),
      render: (value: SessionStatusKeysType) => sessionStatuses[value]
    },
    {
      dataIndex: 'actions',
      key: 'actions',
      render: (_, record) => {
        if (record.status !== SessionStatusKeysType.allowed) {
          return null
        }
        return (
          <>
            {hasRevokePermission && (
              <Popconfirm
                title="Закончить эту сессию?"
                onConfirm={() => handleRevokeSessions(record.id)}
              >
                <Tooltip key="LogoutOutlined" title="Закончить сессию">
                  <Button
                    data-cy="sessions-page__content__table__logout-btn"
                    icon={<LogoutOutlined />}
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </>
        )
      }
    }
  ]

  const totalCount = (currentData ?? data)?.totalCount ?? 0
  return (
    <section className="sessions-page">
      <header className="sessions-page__header">
        <span
          data-cy="sessions-page__header__title"
          className="sessions-page__header__title"
        >
          Пользовательские сессии
        </span>
        {isPageAvailable && (
          <DownloadCsvButton
            type="session"
            params={{
              limit,
              offset: (currentPage - 1) * limit,
              ...searchParams
            }}
            disabled={isFetching || isError || !currentData?.items.length}
          />
        )}
      </header>
      <section className="sessions-page__content">
        {isError && (
          <Alert
            type="error"
            title="Не удалось загрузить пользовательские сессии"
          />
        )}
        <div className="sessions-page__content__wrap-table">
          <Table
            className="sessions-page__content__table"
            rowKey={(record) => record.id}
            pagination={false}
            dataSource={currentData?.items ?? []}
            loading={isFetching}
            onChange={handleTableChange}
            columns={columns}
          />
        </div>
        <div className="sessions-page__content__pagination">
          <Pagination
            showSizeChanger={false}
            current={currentPage}
            total={totalCount}
            pageSize={limit}
            onChange={setCurrentPage}
            disabled={isFetching}
          />
        </div>
      </section>
    </section>
  )
}

export default SessionsPage
