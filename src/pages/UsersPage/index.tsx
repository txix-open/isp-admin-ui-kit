import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  PlusSquareOutlined,
  UnlockOutlined
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Empty,
  message,
  Popconfirm,
  Result,
  Space,
  Table,
  Tag,
  Tooltip
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { dateFormats } from '@constants/date'

import PageLayout from '@components/PageLayout'

import { notifyApiError } from '@utils/apiErrorNotifications'
import { getUserFullName } from '@utils/userUtils/getFullNameUtil'

import useRole from '@hooks/useRole'

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
  const { hasPermission } = useRole()
  const isPageAvailable = hasPermission(PermissionKeysType.user_view)
  const usersQuery = userServiceApi.useGetAllUsersQuery(undefined, {
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

  const resetFilters = () => {
    const params = new URLSearchParams(searchParams)
    for (const key of ['search', 'role', 'status', 'page']) params.delete(key)
    setSearchParams(params, { replace: true })
  }

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
        onConfirm={() => handleBlockUser(userData)}
      >
        <Tooltip key="LockOutlined" title={tooltipTitle}>
          <Button
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
    return <Result status="403" title="Нет доступа к списку пользователей" />
  }

  const columns: ColumnsType<UserType> = [
    {
      title: 'ID',
      width: 80,
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Пользователь',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => getUserFullName(record)
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Статус',
      dataIndex: 'blocked',
      key: 'blocked',
      render: (blocked: boolean) =>
        blocked ? (
          <Tag color="error">Заблокирован</Tag>
        ) : (
          <Tag>Не заблокирован</Tag>
        )
    },
    {
      title: 'Роль',
      dataIndex: 'roles',
      key: 'roles',
      render: (values: number[]) => {
        return values.length
          ? values.map((id) => (
              <div key={id} className="role-item">
                {roles.find((role) => role.id === id)?.name ?? `Роль #${id}`}
              </div>
            ))
          : 'Не назначена'
      }
    },
    {
      title: 'Последняя сессия',
      dataIndex: 'lastSessionCreatedAt',
      key: 'lastSessionCreatedAt',
      render: (value: string) =>
        value ? dayjs(value).format(dateFormats.fullFormat) : 'Нет сессий'
    },
    {
      title: 'Действия',
      dataIndex: 'actions',
      align: 'right',
      key: 'actions',
      render: (_, record) => {
        return (
          <div className="users-page__content__table__actions">
            <Space.Compact className="button_group">
              {hasBlockUserPermission && renderBlockButton(record)}
              {hasUpdateUserPermission && (
                <Tooltip key="EditOutlined" title="Редактировать пользователя">
                  <Button
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
                  title={`Удалить пользователя ${getUserFullName(record)}?`}
                  description="Это действие нельзя отменить."
                  onConfirm={() => handleDeleteUser(record.id)}
                >
                  <Tooltip key="DeleteOutlined" title="Удалить пользователя">
                    <Button
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
            </Space.Compact>
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
      description="Учётные записи, назначенные роли и доступ к системе."
      actions={
        hasCreateUserPermission && (
          <Button
            disabled={!hasCreateUserPermission}
            onClick={() => openEditor('new')}
            data-cy="users-page__header__addButton"
            type="primary"
            icon={<PlusSquareOutlined />}
          >
            Создать пользователя
          </Button>
        )
      }
    >
      <UsersFilters
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
      <p className="users-page__summary" role="status">
        {usersQuery.isLoading
          ? 'Загрузка пользователей…'
          : `Найдено ${filteredUsers.length} из ${allUsers.length} загруженных пользователей`}
      </p>
      <div className="users-page__content__wrap-table">
        <Table<UserType>
          data-cy="users-page__content__table"
          rowKey="id"
          size="small"
          loading={usersQuery.isFetching}
          scroll={{ x: 1050 }}
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
              usersQuery.isError && !usersQuery.data ? (
                'Список недоступен. Повторите загрузку.'
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    hasFilters
                      ? 'По заданным условиям пользователи не найдены'
                      : 'Пользователей пока нет'
                  }
                >
                  {hasFilters && (
                    <Button onClick={resetFilters}>Сбросить фильтры</Button>
                  )}
                </Empty>
              )
          }}
          dataSource={filteredUsers}
          columns={columns}
        />
      </div>
    </PageLayout>
  )
}

export default UsersPage
