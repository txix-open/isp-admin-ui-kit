import { LogoutOutlined, ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, message, Popconfirm, Table, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'

import { SessionStatusKeysType, sessionStatuses } from '@constants/statuses'

import { getColumnSearchProps } from '@components/ColumnSearch'
import { highlightSearchMatch } from '@components/ColumnSearch/highlightSearchMatch'
import DownloadCsvButton from '@components/DownloadCsvButton'
import PageLayout, { PageAccessDenied } from '@components/PageLayout'
import {
  TableActionButton,
  TableActions,
  TableDate,
  TableEmpty,
  TableStatus
} from '@components/TableUI'

import { notifyApiError } from '@utils/apiErrorNotifications'
import { getUserFullName } from '@utils/userUtils/getFullNameUtil'

import usePagePagination from '@hooks/usePagePagination'
import useRole from '@hooks/useRole'
import { useTableSearch } from '@hooks/useTableSearch'

import sessionServiceApi from '@services/sessionService'
import userServiceApi from '@services/userService'

import { PermissionKeysType } from '@type/roles.type'
import { SessionType } from '@type/session.type'

const limit = 10

const SessionsPage = () => {
  const tableSearch = useTableSearch<SessionType>(
    ['createdAt', 'expiredAt'],
    ['userId', 'status']
  )
  const { hasPermission } = useRole()
  const canView = hasPermission(PermissionKeysType.session_view)
  const canViewUsers = hasPermission(PermissionKeysType.user_view)
  const canRevoke = hasPermission(PermissionKeysType.session_revoke)
  const { page, offset, changePage } = usePagePagination(limit)
  const query = sessionServiceApi.useGetAllSessionsQuery(
    { limit, offset, ...tableSearch.searchParams },
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

  const statusTones = {
    [SessionStatusKeysType.allowed]: 'success',
    [SessionStatusKeysType.revoked]: 'neutral',
    [SessionStatusKeysType.expired]: 'warning'
  } as const

  const columns: ColumnsType<SessionType> = [
    {
      title: 'Пользователь',
      dataIndex: 'userId',
      ...getColumnSearchProps<SessionType>({
        title: 'Пользователь',
        type: 'select',
        options: (usersQuery.data ?? []).map((user) => ({
          value: user.id,
          label: getUserFullName(user)
        }))
      }),
      sorter: true,
      key: 'userId',
      className: 'admin-table-name',
      render: (id) => {
        const user = usersQuery.data?.find(
          (item) => String(item.id) === String(id)
        )
        return user ? getUserFullName(user) : `Пользователь #${id}`
      }
    },
    {
      title: 'ID сессии',
      dataIndex: 'id',
      ...getColumnSearchProps<SessionType>({ title: 'ID', type: 'number' }),
      sorter: true,
      key: 'id',
      render: (value) => highlightSearchMatch(value, tableSearch.query?.id),
      width: 110,
      className: 'admin-table-meta admin-table-number'
    },
    {
      title: 'Начало сессии',
      dataIndex: 'createdAt',
      ...getColumnSearchProps<SessionType>({
        title: 'Начало сессии',
        type: 'date',
        showTime: true
      }),
      sorter: true,
      key: 'createdAt',
      render: (value) => <TableDate value={value} />
    },
    {
      title: 'Окончание сессии',
      dataIndex: 'expiredAt',
      ...getColumnSearchProps<SessionType>({
        title: 'Окончание сессии',
        type: 'date',
        showTime: true
      }),
      sorter: true,
      key: 'expiredAt',
      render: (value) => <TableDate value={value} />
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      ...getColumnSearchProps<SessionType>({
        title: 'Статус',
        type: 'select',
        options: Object.entries(sessionStatuses).map(([value, label]) => ({
          value,
          label
        }))
      }),
      sorter: true,
      key: 'status',
      width: 140,
      render: (status: SessionStatusKeysType) => (
        <TableStatus tone={statusTones[status]}>
          {sessionStatuses[status] ?? status}
        </TableStatus>
      )
    },
    ...(canRevoke
      ? [
          {
            title: 'Действия',
            key: 'actions',
            width: 112,
            align: 'right' as const,
            render: (_: unknown, record: SessionType) =>
              record.status === SessionStatusKeysType.allowed && (
                <TableActions>
                  <Popconfirm
                    title={`Завершить сессию #${record.id}?`}
                    description="Пользователю потребуется войти снова."
                    okText="Завершить"
                    okButtonProps={{ danger: true }}
                    cancelText="Отмена"
                    onConfirm={() => handleRevoke(record.id)}
                  >
                    <Tooltip title="Завершить сессию">
                      <TableActionButton
                        danger
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
                </TableActions>
              )
          }
        ]
      : [])
  ]

  if (!canView)
    return (
      <PageAccessDenied
        title="Пользовательские сессии"
        context="Пользователи и роли"
      />
    )

  return (
    <PageLayout
      className="sessions-page"
      title="Пользовательские сессии"
      context="Пользователи и роли"
      actions={
        <>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => query.refetch()}
            loading={query.isFetching}
          >
            Обновить
          </Button>
          <DownloadCsvButton
            type="session"
            params={{ limit, offset, ...tableSearch.searchParams }}
            disabled={query.isFetching || query.isError || !data?.items.length}
          />
        </>
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
            <Button
              icon={<ReloadOutlined />}
              onClick={() => query.refetch()}
              loading={query.isFetching}
            >
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
        onChange={(pagination, filters, sorter, extra) => {
          if (extra.action === 'paginate') return
          tableSearch.handleTableChange(pagination, filters, sorter, extra)
          changePage(1)
        }}
        className="page-layout__table admin-table"
        size="middle"
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
          hideOnSinglePage: true,
          onChange: changePage
        }}
        locale={{
          emptyText:
            query.isFetching || (query.isError && !data) ? null : (
              <TableEmpty description="Сессий пока нет" />
            )
        }}
      />
    </PageLayout>
  )
}

export default SessionsPage
