import { LogoutOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Empty,
  message,
  Popconfirm,
  Result,
  Table,
  Tag,
  Tooltip
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

import { dateFormats } from '@constants/date'
import { SessionStatusKeysType, sessionStatuses } from '@constants/statuses'

import PageLayout from '@components/PageLayout'

import { notifyApiError } from '@utils/apiErrorNotifications'
import { getUserFullName } from '@utils/userUtils/getFullNameUtil'

import usePagePagination from '@hooks/usePagePagination'
import useRole from '@hooks/useRole'

import sessionServiceApi from '@services/sessionService'
import userServiceApi from '@services/userService'

import { PermissionKeysType } from '@type/roles.type'
import { SessionType } from '@type/session.type'

const limit = 10

const SessionsPage = () => {
  const { hasPermission } = useRole()
  const canView = hasPermission(PermissionKeysType.session_view)
  const canViewUsers = hasPermission(PermissionKeysType.user_view)
  const canRevoke = hasPermission(PermissionKeysType.session_revoke)
  const { page, offset, changePage } = usePagePagination(limit)
  const query = sessionServiceApi.useGetAllSessionsQuery(
    { limit, offset },
    { skip: !canView }
  )
  const usersQuery = userServiceApi.useGetAllUsersQuery(undefined, {
    skip: !canView || !canViewUsers
  })
  const [revokeSession, revokeState] =
    sessionServiceApi.useRevokeSessionMutation()
  // currentData prevents showing the previous page under a new page number.
  const data = query.currentData

  const handleRevoke = (id: number) => {
    if (!canRevoke || revokeState.isLoading) return
    return revokeSession(id)
      .unwrap()
      .then(() => {
        message.success('Сессия успешно завершена')
      })
      .catch((error) => {
        notifyApiError(error, 'Не удалось завершить сессию')
      })
  }

  const columns: ColumnsType<SessionType> = [
    {
      title: 'Пользователь',
      dataIndex: 'userId',
      render: (id) => {
        const user = usersQuery.data?.find(
          (item) => String(item.id) === String(id)
        )
        return user ? getUserFullName(user) : `Пользователь #${id}`
      }
    },
    { title: 'ID сессии', dataIndex: 'id', width: 110 },
    {
      title: 'Начало сессии',
      dataIndex: 'createdAt',
      render: (value) => dayjs(value).format(dateFormats.fullFormat)
    },
    {
      title: 'Окончание сессии',
      dataIndex: 'expiredAt',
      render: (value) => dayjs(value).format(dateFormats.fullFormat)
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 140,
      render: (status: SessionStatusKeysType) => (
        <Tag
          color={
            status === SessionStatusKeysType.allowed ? 'success' : 'default'
          }
        >
          {sessionStatuses[status] ?? status}
        </Tag>
      )
    },
    ...(canRevoke
      ? [
          {
            title: 'Действия',
            key: 'actions',
            width: 100,
            render: (_: unknown, record: SessionType) =>
              record.status === SessionStatusKeysType.allowed && (
                <Popconfirm
                  title="Завершить эту сессию?"
                  description="Пользователю потребуется войти снова."
                  okText="Завершить"
                  cancelText="Отмена"
                  onConfirm={() => handleRevoke(record.id)}
                >
                  <Tooltip title="Завершить сессию">
                    <Button
                      data-cy="sessions-page__content__table__logout-btn"
                      aria-label={`Завершить сессию #${record.id}`}
                      icon={<LogoutOutlined />}
                      disabled={revokeState.isLoading}
                      loading={
                        revokeState.isLoading &&
                        revokeState.originalArgs === record.id
                      }
                    />
                  </Tooltip>
                </Popconfirm>
              )
          }
        ]
      : [])
  ]

  if (!canView)
    return (
      <Result status="403" title="Нет доступа к пользовательским сессиям" />
    )

  return (
    <PageLayout
      className="sessions-page"
      title="Пользовательские сессии"
      context="Пользователи и роли"
      description="История входов, сроки действия и завершение активных сессий."
      actions={
        <Button onClick={() => query.refetch()} loading={query.isFetching}>
          Обновить
        </Button>
      }
    >
      {query.isError && (
        <Alert
          type="error"
          showIcon
          title={
            data
              ? 'Не удалось обновить сессии. Показаны ранее загруженные данные.'
              : 'Не удалось загрузить сессии'
          }
          action={
            <Button onClick={() => query.refetch()} loading={query.isFetching}>
              Повторить
            </Button>
          }
        />
      )}
      {usersQuery.isError && (
        <Alert
          type="warning"
          showIcon
          title="Имена пользователей недоступны. Показаны идентификаторы."
          action={
            <Button
              onClick={() => usersQuery.refetch()}
              loading={usersQuery.isFetching}
            >
              Повторить
            </Button>
          }
        />
      )}
      <p className="page-layout__summary" role="status">
        {query.isFetching
          ? 'Загрузка сессий…'
          : data
            ? `Всего сессий: ${data.totalCount}`
            : 'Список сессий недоступен'}
      </p>
      <Table<SessionType>
        className="page-layout__table"
        rowKey="id"
        loading={query.isFetching}
        dataSource={data?.items ?? []}
        columns={columns}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          total: data?.totalCount ?? query.data?.totalCount ?? 0,
          pageSize: limit,
          showSizeChanger: false,
          onChange: changePage
        }}
        locale={{
          emptyText: query.isError ? (
            'Список недоступен. Повторите загрузку.'
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Сессий пока нет"
            />
          )
        }}
      />
    </PageLayout>
  )
}

export default SessionsPage
