import { ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'

import { getColumnSearchProps } from '@components/ColumnSearch'
import TableSearchControls from '@components/ColumnSearch/TableSearchControls'
import { highlightSearchMatch } from '@components/ColumnSearch/highlightSearchMatch'
import DownloadCsvButton from '@components/DownloadCsvButton'
import PageLayout, { PageAccessDenied } from '@components/PageLayout'
import { TableDate, TableEmpty } from '@components/TableUI'
import { useCompactTable } from '@components/TableUI/useCompactTable'

import { getUserFullName } from '@utils/userUtils/getFullNameUtil'

import usePagePagination from '@hooks/usePagePagination'
import useRole from '@hooks/useRole'
import { useTableSearch } from '@hooks/useTableSearch'

import securityLogServiceApi from '@services/securityLogService'
import userServiceApi from '@services/userService'

import { LogType } from '@type/log.type'
import { PermissionKeysType } from '@type/roles.type'

import './security-log-page.scss'

const limit = 10

const SecurityLogPage = () => {
  const { compact, toggle } = useCompactTable()
  const tableSearch = useTableSearch<LogType>(
    ['userId', 'createdAt', 'message'],
    ['createdAt'],
    ['userId']
  )
  const { hasPermission } = useRole()
  const canView = hasPermission(PermissionKeysType.security_log_view)
  const canViewUsers = hasPermission(PermissionKeysType.user_view)
  const { page, offset, changePage } = usePagePagination(limit)
  const query = securityLogServiceApi.useSearchLogsQuery(
    { limit, offset, ...tableSearch.searchParams },
    { skip: !canView }
  )
  const usersQuery = userServiceApi.useGetAllUsersQuery(undefined, {
    skip: !canView || !canViewUsers
  })
  const data = query.currentData
  const getUserName = (id: LogType['userId']) => {
    const user = usersQuery.data?.find((item) => String(item.id) === String(id))
    return user ? getUserFullName(user) : `Пользователь #${id}`
  }

  const columns: ColumnsType<LogType> = [
    {
      title: 'Пользователь',
      dataIndex: 'userId',
      hidden: compact,
      ...getColumnSearchProps<LogType>({
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
      width: 240,
      render: getUserName
    },
    {
      title: 'Время события',
      dataIndex: 'createdAt',
      hidden: compact,
      ...getColumnSearchProps<LogType>({
        title: 'Время события',
        type: 'date',
        showTime: true
      }),
      sorter: true,
      key: 'createdAt',
      width: 190,
      render: (value) => <TableDate value={value} />
    },
    {
      title: 'Действие',
      dataIndex: 'message',
      ...getColumnSearchProps<LogType>({ title: 'Действие' }),
      sorter: true,
      key: 'message',
      render: (value: string, record) => (
        <>
          <div className="security-log-page__message">
            {highlightSearchMatch(value, tableSearch.query?.message)}
          </div>
          {compact && (
            <div className="admin-table-compact-details admin-table-meta">
              <span>{getUserName(record.userId)}</span>
              <TableDate value={record.createdAt} />
            </div>
          )}
        </>
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
        <>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => query.refetch()}
            loading={query.isFetching}
          >
            Обновить
          </Button>
          <DownloadCsvButton
            type="log"
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
      <TableSearchControls
        query={tableSearch.query}
        order={tableSearch.order}
        columns={tableSearch.applyToColumns(columns)}
        options={{
          userId: (usersQuery.data ?? []).map((user) => ({
            value: user.id,
            label: getUserFullName(user)
          }))
        }}
        onRemove={tableSearch.removeFilter}
        onClearSort={tableSearch.clearSort}
        onReset={tableSearch.reset}
      />
      <p className="page-layout__summary" role="status">
        {query.isFetching
          ? 'Загрузка событий…'
          : data
            ? `Всего событий: ${data.totalCount}`
            : 'Журнал недоступен'}
      </p>
      {toggle && <div>{toggle}</div>}
      <Table<LogType>
        onChange={tableSearch.handleTableChange}
        className={`page-layout__table admin-table ${compact ? 'admin-table--compact' : ''}`}
        size="middle"
        rowKey="id"
        loading={query.isFetching}
        dataSource={data?.items ?? []}
        columns={tableSearch.applyToColumns(columns)}
        tableLayout={compact ? 'fixed' : undefined}
        scroll={compact ? undefined : { x: 800 }}
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
              <TableEmpty
                description={
                  tableSearch.query
                    ? 'По заданным условиям события не найдены'
                    : 'Событий пока нет'
                }
              >
                {tableSearch.query && (
                  <Button onClick={() => tableSearch.reset()}>
                    Сбросить фильтры
                  </Button>
                )}
              </TableEmpty>
            )
        }}
      />
    </PageLayout>
  )
}

export default SecurityLogPage
