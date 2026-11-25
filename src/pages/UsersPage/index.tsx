import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  PlusOutlined,
  ReloadOutlined,
  UnlockOutlined
} from '@ant-design/icons'
import {
  Alert,
  Button,
  message,
  Popconfirm,
  Result,
  Table,
  Tooltip
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { getColumnSearchProps } from '@components/ColumnSearch'
import TableSearchControls from '@components/ColumnSearch/TableSearchControls'
import { highlightSearchMatch } from '@components/ColumnSearch/highlightSearchMatch'
import DownloadCsvButton from '@components/DownloadCsvButton'
import EntityDrawer from '@components/EntityDrawer'
import PageLayout, { PageAccessDenied } from '@components/PageLayout'
import {
  TableActionButton,
  TableActions,
  TableDate,
  TableEmpty,
  TableStatus
} from '@components/TableUI'
import { useCompactTable } from '@components/TableUI/useCompactTable'

import UserEditorForm from '@pages/UserEditor/UserEditorForm'

import { notifyApiError } from '@utils/apiErrorNotifications'
import {
  deleteConfirmation,
  irreversibleDelete
} from '@utils/deleteConfirmation'
import { getUserFullName } from '@utils/userUtils/getFullNameUtil'

import useRole from '@hooks/useRole'
import { useTableSearch } from '@hooks/useTableSearch'

import roleApi from '@services/roleService'
import userServiceApi from '@services/userService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'
import { UserType } from '@type/user.type'

import UsersFilters from './UsersFilters'
import { filterUsers, getUsersPage, readUserFilters } from './userFilters'
import './users-page.scss'

const pageSize = 20

const UsersPage = () => {
  const { compact, toggle } = useCompactTable()
  const tableSearch = useTableSearch<UserType>(
    ['id', 'userId', 'description', 'email', 'roles', 'lastSessionCreatedAt'],
    ['lastSessionCreatedAt'],
    ['userId', 'roles']
  )
  const { hasPermission } = useRole()
  const isPageAvailable = hasPermission(PermissionKeysType.user_view)
  const usersQuery = userServiceApi.useGetAllUsersQuery(
    tableSearch.searchParams,
    {
      skip: !isPageAvailable
    }
  )
  const userOptionsQuery = userServiceApi.useGetAllUsersQuery(undefined, {
    skip: !isPageAvailable
  })
  const rolesQuery = roleApi.useGetAllRolesQuery(undefined, {
    skip: !isPageAvailable
  })
  const allUsers = usersQuery.data ?? []
  const roles = rolesQuery.data ?? []
  const [blockUser, blockState] = userServiceApi.useBlockUserMutation()
  const [deleteUser, deleteState] = userServiceApi.useDeleteUserMutation()
  const isActionPending = blockState.isLoading || deleteState.isLoading
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const createOpen = searchParams.get('create') === 'user'
  const closeCreate = () =>
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('create')
        return next
      },
      { replace: true }
    )
  const openCreate = () =>
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      next.set('create', 'user')
      return next
    })
  const filters = readUserFilters(searchParams)
  const filteredUsers = filterUsers(allUsers, filters)
  const currentPage = getUsersPage(searchParams, filteredUsers.length, pageSize)
  const hasFilters = Boolean(
    filters.search || filters.roleId !== undefined || filters.status !== 'all'
  )
  const roleIds = new Set([
    ...roles.map((role) => role.id),
    ...allUsers.flatMap((user) => user.roles)
  ])
  if (filters.roleId !== undefined) roleIds.add(filters.roleId)
  const roleOptions = Array.from(roleIds, (id) => ({
    value: id,
    label: roles.find((role) => role.id === id)?.name ?? `Роль #${id}`
  }))

  const hasBlockUserPermission = hasPermission(PermissionKeysType.user_block)
  const hasDeleteUserPermission = hasPermission(PermissionKeysType.user_delete)
  const hasUpdateUserPermission = hasPermission(PermissionKeysType.user_update)
  const hasCreateUserPermission = hasPermission(PermissionKeysType.user_create)

  const updateFilter = (name: 'search' | 'role' | 'status', value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(name, value)
    else params.delete(name)
    params.delete('page')
    setSearchParams(params, { replace: true })
  }

  const resetFilters = () => tableSearch.reset(['search', 'role', 'status'])

  const openEditor = (id: number | 'new') =>
    navigate({
      pathname: `${routePaths.users}/${id}`,
      search: searchParams.toString()
    })

  const handleDeleteUser = (userId: number) => {
    if (isActionPending || !hasDeleteUserPermission) return
    return deleteUser(userId)
      .unwrap()
      .then(() => {
        message.success('Пользователь успешно удален')
      })
      .catch((error) => {
        notifyApiError(error, 'Не удалось удалить пользователя')
      })
  }

  const handleBlockUser = (user: UserType) => {
    if (isActionPending || !hasBlockUserPermission) return
    const name = getUserFullName(user)
    return blockUser(user.id)
      .unwrap()
      .then(() => {
        message.success(
          user.blocked
            ? `Пользователь ${name} разблокирован`
            : `Пользователь ${name} заблокирован`
        )
      })
      .catch((error) => {
        notifyApiError(
          error,
          user.blocked
            ? `Не удалось разблокировать пользователя ${name}`
            : `Не удалось заблокировать пользователя ${name}`
        )
      })
  }

  const renderBlockButton = (userData: UserType) => {
    const { blocked, id } = userData

    const popConfirmTitle = blocked
      ? `Разблокировать пользователя ${getUserFullName(userData)}?`
      : `Заблокировать пользователя ${getUserFullName(userData)}?`

    const tooltipTitle = blocked
      ? 'Разблокировать пользователя'
      : 'Заблокировать пользователя'

    const icon = blocked ? <UnlockOutlined /> : <LockOutlined />

    return (
      <Popconfirm
        title={popConfirmTitle}
        okText={blocked ? 'Разблокировать' : 'Заблокировать'}
        cancelText="Отмена"
        okButtonProps={{ danger: !blocked }}
        onConfirm={() => handleBlockUser(userData)}
      >
        <Tooltip key="LockOutlined" title={tooltipTitle}>
          <TableActionButton
            data-cy={`users-page__content__table__actions__lock-btn ${id}`}
            className="users-page__content__table__actions__lock-btn"
            icon={icon}
            aria-label={`${tooltipTitle}: ${getUserFullName(userData)}`}
            disabled={isActionPending}
            loading={blockState.isLoading && blockState.originalArgs === id}
          />
        </Tooltip>
      </Popconfirm>
    )
  }

  if (!isPageAvailable) {
    return (
      <PageAccessDenied title="Пользователи" context="Пользователи и роли" />
    )
  }

  const renderStatus = (blocked: boolean) => (
    <TableStatus tone={blocked ? 'error' : 'neutral'}>
      {blocked ? 'Заблокирован' : 'Не заблокирован'}
    </TableStatus>
  )

  const columns: ColumnsType<UserType> = [
    {
      title: 'ID',
      width: 80,
      dataIndex: 'id',
      hidden: compact,
      ...getColumnSearchProps<UserType>({ title: 'ID', type: 'number' }),
      sorter: true,
      render: (value) => highlightSearchMatch(value, tableSearch.query?.id),
      key: 'id',
      className: 'admin-table-meta admin-table-number'
    },
    {
      title: 'Пользователь',
      width: compact ? undefined : 220,
      dataIndex: 'userId',
      sorter: true,
      ...getColumnSearchProps<UserType>({
        title: 'Пользователь',
        type: 'select',
        options: (userOptionsQuery.data ?? []).map((user) => ({
          value: user.id,
          label: getUserFullName(user)
        }))
      }),
      key: 'userId',
      className: 'admin-table-name',
      render: (_, record) =>
        compact ? (
          <>
            <div>{getUserFullName(record)}</div>
            <div className="admin-table-compact-details">
              {record.email && (
                <span className="admin-table-meta">{record.email}</span>
              )}
              {renderStatus(record.blocked)}
            </div>
          </>
        ) : (
          getUserFullName(record)
        )
    },
    {
      title: 'Описание',
      width: 240,
      dataIndex: 'description',
      hidden: compact,
      ...getColumnSearchProps<UserType>({ title: 'Описание' }),
      sorter: true,
      render: (value) =>
        highlightSearchMatch(value, tableSearch.query?.description),
      key: 'description',
      className: 'admin-table-meta'
    },
    {
      title: 'Email',
      width: 240,
      dataIndex: 'email',
      hidden: compact,
      ...getColumnSearchProps<UserType>({ title: 'Email' }),
      sorter: true,
      render: (value) => highlightSearchMatch(value, tableSearch.query?.email),
      key: 'email'
    },
    {
      title: 'Статус',
      width: 170,
      dataIndex: 'blocked',
      hidden: compact,
      key: 'blocked',
      render: renderStatus
    },
    {
      title: 'Роль',
      width: 160,
      dataIndex: 'roles',
      hidden: compact,
      ...getColumnSearchProps<UserType>({
        title: 'Роль',
        type: 'select',
        options: roles.map((role) => ({ value: role.id, label: role.name }))
      }),
      key: 'roles',
      render: (values: number[]) => {
        return values.length
          ? values.map((id) => (
              <div key={id} className="role-item">
                {highlightSearchMatch(
                  roles.find((role) => role.id === id)?.name ?? `Роль #${id}`,
                  Array.isArray(tableSearch.query?.roles) &&
                    tableSearch.query.roles.includes(id)
                    ? roles.find((role) => role.id === id)?.name
                    : undefined
                )}
              </div>
            ))
          : 'Не назначена'
      }
    },
    {
      title: 'Последняя сессия',
      width: 160,
      dataIndex: 'lastSessionCreatedAt',
      hidden: compact,
      ...getColumnSearchProps<UserType>({
        title: 'Последняя сессия',
        type: 'date'
      }),
      sorter: true,
      key: 'lastSessionCreatedAt',
      render: (value: string) => <TableDate value={value} empty="Нет сессий" />
    },
    {
      title: 'Действия',
      dataIndex: 'actions',
      align: 'right',
      key: 'actions',
      width: compact ? 120 : 152,
      render: (_, record) => {
        return (
          <div className="users-page__content__table__actions">
            <TableActions>
              {hasBlockUserPermission && renderBlockButton(record)}
              {hasUpdateUserPermission && (
                <Tooltip key="EditOutlined" title="Редактировать пользователя">
                  <TableActionButton
                    data-cy={`users-page__content__table__actions__edit-btn ${record.id}`}
                    className="users-page__content__table__actions__edit-btn"
                    icon={<EditOutlined />}
                    aria-label={`Редактировать пользователя: ${getUserFullName(record)}`}
                    disabled={isActionPending}
                    onClick={() => openEditor(record.id)}
                  />
                </Tooltip>
              )}
              {hasDeleteUserPermission && (
                <Popconfirm
                  placement="bottom"
                  title={`Удалить пользователя «${getUserFullName(record)}»?`}
                  description={irreversibleDelete}
                  {...deleteConfirmation}
                  onConfirm={() => handleDeleteUser(record.id)}
                >
                  <Tooltip key="DeleteOutlined" title="Удалить пользователя">
                    <TableActionButton
                      data-cy={`users-page__content__table__actions__delete-btn ${record.id}`}
                      className="users-page__content__table__actions__delete-btn"
                      icon={<DeleteOutlined />}
                      danger
                      aria-label={`Удалить пользователя: ${getUserFullName(record)}`}
                      disabled={isActionPending}
                      loading={
                        deleteState.isLoading &&
                        deleteState.originalArgs === record.id
                      }
                    />
                  </Tooltip>
                </Popconfirm>
              )}
            </TableActions>
          </div>
        )
      }
    }
  ]

  return (
    <PageLayout
      className="users-page"
      title="Пользователи"
      context="Пользователи и роли"
      actions={
        <>
          <Button
            icon={<ReloadOutlined />}
            loading={usersQuery.isFetching || rolesQuery.isFetching}
            onClick={() => {
              void usersQuery.refetch()
              void rolesQuery.refetch()
            }}
          >
            Обновить
          </Button>
          <DownloadCsvButton
            type="user"
            params={{ limit: 1000, offset: 0, ...tableSearch.searchParams }}
            disabled={
              hasFilters ||
              usersQuery.isFetching ||
              usersQuery.isError ||
              !usersQuery.currentData?.length
            }
          />
          {hasCreateUserPermission && (
            <Button
              onClick={openCreate}
              data-cy="users-page__header__addButton"
              type="primary"
              icon={<PlusOutlined />}
            >
              Новый пользователь
            </Button>
          )}
        </>
      }
    >
      <UsersFilters
        hasTableFilters={Boolean(tableSearch.searchParams)}
        filters={filters}
        roleOptions={roleOptions}
        onChange={updateFilter}
        onReset={resetFilters}
      />
      {usersQuery.isError && (
        <Alert
          type="error"
          showIcon
          title={
            usersQuery.data
              ? 'Не удалось обновить список. Показаны ранее загруженные данные.'
              : 'Не удалось загрузить пользователей'
          }
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
      {rolesQuery.isError && (
        <Alert
          type="warning"
          showIcon
          title="Не удалось загрузить названия ролей. Вместо них показаны идентификаторы."
          action={
            <Button
              onClick={() => rolesQuery.refetch()}
              loading={rolesQuery.isFetching}
            >
              Повторить
            </Button>
          }
        />
      )}
      {allUsers.length >= 1000 && (
        <Alert
          type="info"
          showIcon
          title="Список ограничен 1000 пользователями. Поиск и фильтры применяются к этому списку."
        />
      )}
      <TableSearchControls
        query={tableSearch.query}
        order={tableSearch.order}
        columns={columns}
        options={{
          userId: (userOptionsQuery.data ?? []).map((user) => ({
            value: user.id,
            label: getUserFullName(user)
          })),
          roles: roleOptions
        }}
        onRemove={tableSearch.removeFilter}
        onClearSort={tableSearch.clearSort}
        onReset={resetFilters}
      />
      <p className="users-page__summary" role="status">
        {usersQuery.isLoading
          ? 'Загрузка пользователей…'
          : usersQuery.isError && !usersQuery.data
            ? 'Список пользователей недоступен'
            : `Найдено ${filteredUsers.length} из ${allUsers.length} загруженных пользователей`}
      </p>
      {hasFilters && (
        <p className="users-page__summary">
          Для выгрузки CSV снимите фильтры загруженного списка. CSV учитывает
          фильтры в заголовках колонок.
        </p>
      )}
      {toggle && <div>{toggle}</div>}
      <div className="users-page__content__wrap-table">
        <Table<UserType>
          onChange={tableSearch.handleTableChange}
          data-cy="users-page__content__table"
          className={
            compact ? 'admin-table admin-table--compact' : 'admin-table'
          }
          rowKey="id"
          size="middle"
          loading={usersQuery.isFetching}
          tableLayout={compact ? 'fixed' : undefined}
          scroll={compact ? undefined : { x: 1422 }}
          pagination={{
            current: currentPage,
            pageSize,
            total: filteredUsers.length,
            showSizeChanger: false,
            hideOnSinglePage: true,
            onChange: (page) => {
              const params = new URLSearchParams(searchParams)
              params.set('page', String(page))
              setSearchParams(params)
            }
          }}
          locale={{
            emptyText:
              usersQuery.isFetching ||
              (usersQuery.isError && !usersQuery.data) ? null : (
                <TableEmpty
                  description={
                    hasFilters || tableSearch.query
                      ? 'По заданным условиям пользователи не найдены'
                      : 'Пользователей пока нет'
                  }
                >
                  {hasFilters || tableSearch.query ? (
                    <Button onClick={resetFilters}>Сбросить фильтры</Button>
                  ) : hasCreateUserPermission ? (
                    <Button onClick={openCreate}>Новый пользователь</Button>
                  ) : null}
                </TableEmpty>
              )
          }}
          dataSource={filteredUsers}
          columns={tableSearch
            .applyToColumns(columns)
            .filter(
              (column) =>
                column.key !== 'actions' ||
                hasBlockUserPermission ||
                hasUpdateUserPermission ||
                hasDeleteUserPermission
            )}
        />
      </div>
      {hasCreateUserPermission && createOpen && (
        <EntityDrawer
          title="Новый пользователь"
          open={createOpen}
          busy={isCreatingUser}
          onClose={closeCreate}
        >
          {rolesQuery.isError && !rolesQuery.data ? (
            <Result
              status="error"
              title="Не удалось загрузить роли"
              extra={
                <>
                  <Button onClick={closeCreate}>Отмена</Button>
                  <Button
                    onClick={() => rolesQuery.refetch()}
                    loading={rolesQuery.isFetching}
                  >
                    Повторить
                  </Button>
                </>
              }
            />
          ) : rolesQuery.isLoading ? (
            <div>
              <Button onClick={closeCreate}>Отмена</Button>
              <p role="status">Загрузка ролей…</p>
            </div>
          ) : (
            <UserEditorForm
              roles={roles}
              onCancel={closeCreate}
              onCreated={closeCreate}
              onSavingChange={setIsCreatingUser}
            />
          )}
        </EntityDrawer>
      )}
    </PageLayout>
  )
}

export default UsersPage
