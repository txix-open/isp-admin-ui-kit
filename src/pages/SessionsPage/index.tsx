import { LogoutOutlined } from '@ant-design/icons'
import {
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
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { dateFormats } from '@constants/date.ts'
import { SessionStatusKeysType, sessionStatuses } from '@constants/statuses'

import { getUserFullName } from '@utils/userUtils/getFullNameUtil'

import useRole from '@hooks/useRole'

import sessionServiceApi from '@services/sessionService'
import userServiceApi from '@services/userService'

import { routePaths } from '@routes/routePaths.ts'

import { PermissionKeysType } from '@type/roles.type.ts'
import { SessionType } from '@type/session.type'

import './sessions-page.scss'

const limit = 10

const SessionsPage = () => {
  const [offset, setOffset] = useState<number>(0)
  const { data, isLoading: isLoadingSession } =
    sessionServiceApi.useGetAllSessionsQuery({ limit, offset })
  const [revokeSession] = sessionServiceApi.useRevokeSessionMutation()
  const { data: allUsers = [], isLoading: isUsersLoading } =
    userServiceApi.useGetAllUsersQuery()
  const { role, hasPermission } = useRole()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)

  const isLoading = isUsersLoading || isLoadingSession

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

  const handleChangePagination = (page: number) => {
    setCurrentPage(page)
    const currentOffset = (page - 1) * limit
    setOffset(currentOffset)
  }

  const handleRevokeSessions = (id: number) => {
    revokeSession(id)
      .unwrap()
      .then(() => message.success('Сессия успешно завершена'))
      .catch(() => message.error('Не удалось завершить сессию'))
  }

  if (isLoading || !data) {
    return <Spin />
  }

  const columns: ColumnsType<SessionType> = [
    {
      title: 'Пользователь',
      dataIndex: 'userId',
      key: 'userId',
      render: (value) => {
        const user = allUsers.find((el) => el.id === value)
        return user && getUserFullName(user)
      }
    },
    {
      title: 'Идентификатор',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Дата начала сессии',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => {
        return dayjs(value).format(dateFormats.fullFormat)
      }
    },
    {
      title: 'Дата окончания сессии',
      dataIndex: 'expiredAt',
      key: 'expiredAt',
      render: (value) => {
        return dayjs(value).format(dateFormats.fullFormat)
      }
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
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

  const { totalCount, items } = data
  return (
    <section className="sessions-page">
      <header className="sessions-page__header">
        <span
          data-cy="sessions-page__header__title"
          className="sessions-page__header__title"
        >
          Пользовательские сессии
        </span>
      </header>
      <section className="sessions-page__content">
        <div className="sessions-page__content__wrap-table">
          <Table
            className="sessions-page__content__table"
            rowKey={(record) => record.id}
            pagination={false}
            dataSource={items}
            columns={columns}
          />
        </div>
        <div className="sessions-page__content__pagination">
          <Pagination
            showSizeChanger={false}
            current={currentPage}
            total={totalCount}
            pageSize={limit}
            onChange={handleChangePagination}
          />
        </div>
      </section>
    </section>
  )
}

export default SessionsPage
