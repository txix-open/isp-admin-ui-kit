import { ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'

import PageLayout, { PageAccessDenied } from '@components/PageLayout'
import { TableDate, TableEmpty } from '@components/TableUI'

import { getUserFullName } from '@utils/userUtils/getFullNameUtil'

import usePagePagination from '@hooks/usePagePagination'
import useRole from '@hooks/useRole'

import securityLogServiceApi from '@services/securityLogService'
import userServiceApi from '@services/userService'

import { LogType } from '@type/log.type'
import { PermissionKeysType } from '@type/roles.type'

import './security-log-page.scss'

const limit = 10

const SecurityLogPage = () => {
  const { hasPermission } = useRole()
  const canView = hasPermission(PermissionKeysType.security_log_view)
  const canViewUsers = hasPermission(PermissionKeysType.user_view)
  const { page, offset, changePage } = usePagePagination(limit)
  const query = securityLogServiceApi.useGetLogsPageQuery(
    { limit, offset },
    { skip: !canView }
  )
  const usersQuery = userServiceApi.useGetAllUsersQuery(undefined, {
    skip: !canView || !canViewUsers
  })
  const data = query.currentData
  const columns: ColumnsType<LogType> = [
    {
      title: 'Пользователь',
      dataIndex: 'userId',
      className: 'admin-table-name',
      width: 240,
      render: (id) => {
        const user = usersQuery.data?.find(
          (item) => String(item.id) === String(id)
        )
        return user ? getUserFullName(user) : `Пользователь #${id}`
      }
    },
    {
      title: 'Время события',
      dataIndex: 'createdAt',
      width: 190,
      render: (value) => <TableDate value={value} />
    },
    {
      title: 'Действие',
      dataIndex: 'message',
      render: (value: string) => (
        <div className="security-log-page__message">{value}</div>
      )
    }
  ]

  if (!canView)
    return (
      <PageAccessDenied title="Журнал событий" context="Пользователи и роли" />
    )

  return (
    <PageLayout
      className="security-log-page"
      title="Журнал событий"
      context="Пользователи и роли"
      actions={
        <Button
          icon={<ReloadOutlined />}
          onClick={() => query.refetch()}
          loading={query.isFetching}
        >
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
              ? 'Не удалось обновить журнал. Показаны ранее загруженные данные.'
              : 'Не удалось загрузить журнал событий'
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
          ? 'Загрузка событий…'
          : data
            ? `Всего событий: ${data.totalCount}`
            : 'Журнал недоступен'}
      </p>
      <Table<LogType>
        className="page-layout__table admin-table"
        size="middle"
        rowKey="id"
        loading={query.isFetching}
        dataSource={data?.items ?? []}
        columns={columns}
        scroll={{ x: 800 }}
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
              <TableEmpty description="Событий пока нет" />
            )
        }}
      />
    </PageLayout>
  )
}

export default SecurityLogPage
