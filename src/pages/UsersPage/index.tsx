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
  message,
  Popconfirm,
  Spin,
  Table,
  Tag,
  Tooltip
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { dateFormats } from '@constants/date'

import { getColumnSearchProps } from '@components/ColumnSearch'
import { highlightSearchMatch } from '@components/ColumnSearch/highlightSearchMatch'

import { getUserFullName } from '@utils/userUtils/getFullNameUtil'

import useRole from '@hooks/useRole'
import { useTableSearch } from '@hooks/useTableSearch'

import roleApi from '@services/roleService'
import userServiceApi from '@services/userService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'
import { UserType } from '@type/user.type'

import './users-page.scss'

const UsersPage = () => {
  const { query, searchParams, handleTableChange } = useTableSearch<UserType>(
    ['lastSessionCreatedAt'],
    ['userId', 'roles']
  )
  const {
    data: userOptions = [],
    isLoading: isUsersLoading,
    isError: isUsersError
  } = userServiceApi.useGetAllUsersQuery()
  const {
    currentData: searchResults,
    isFetching: isSearching,
    isError: isSearchError
  } = userServiceApi.useGetAllUsersQuery(searchParams, {
    skip: !searchParams
  })
  const allUsers = searchParams ? (searchResults ?? []) : userOptions
  const searchedRoles = query?.roles
  const { data: roles, isLoading: isRolesLoading } =
    roleApi.useGetAllRolesQuery()
  const [blockUser] = userServiceApi.useBlockUserMutation()
  const [deleteUser] = userServiceApi.useDeleteUserMutation()
  const { role, hasPermission } = useRole()
  const navigate = useNavigate()

  const isLoading = isRolesLoading || isUsersLoading

  const isPageAvailable = hasPermission(PermissionKeysType.user_view)
  const hasBlockUserPermission = hasPermission(PermissionKeysType.user_block)
  const hasDeleteUserPermission = hasPermission(PermissionKeysType.user_delete)
  const hasUpdateUserPermission = hasPermission(PermissionKeysType.user_update)
  const hasCreateUserPermission = hasPermission(PermissionKeysType.user_create)

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

  const handleDeleteUser = (userId: number) => {
    deleteUser(userId)
      .unwrap()
      .then(() => message.success('Пользователь успешно удален'))
      .catch(() => message.error('Не удалось удалить пользователя'))
  }

  const handleBlockUser = (userId: number) => {
    const currentUser = allUsers.find((el) => el.id === userId)
    const successMessage = currentUser?.blocked
      ? `Пользователь ${currentUser.lastName} ${currentUser.firstName} успешно разблокирован`
      : `Пользователь ${currentUser?.lastName} ${currentUser?.firstName} успешно заблокирован`
    const errorMessage = currentUser?.blocked
      ? `Не удалось разблокировать пользователя ${currentUser.lastName} ${currentUser.firstName}`
      : `Не удалось заблокировать пользователя ${currentUser?.lastName} ${currentUser?.firstName}`
    blockUser(userId)
      .unwrap()
      .then(() => message.success(successMessage))
      .catch(() => message.error(<>{errorMessage}</>))
  }

  const renderBlockButton = (userData: UserType) => {
    const { blocked, id } = userData

    const popConfirmTitle = blocked
      ? 'Вы действительно хотите разблокировать этого пользователя?'
      : 'Вы действительно хотите заблокировать этого пользователя?'

    const tooltipTitle = blocked
      ? 'Разблокировать пользователя'
      : 'Заблокировать пользователя'

    const icon = blocked ? <UnlockOutlined /> : <LockOutlined />

    return (
      <Popconfirm title={popConfirmTitle} onConfirm={() => handleBlockUser(id)}>
        <Tooltip key="LockOutlined" title={tooltipTitle}>
          <Button
            data-cy={`users-page__content__table__actions__lock-btn ${id}`}
            className="users-page__content__table__actions__lock-btn"
            icon={icon}
          />
        </Tooltip>
      </Popconfirm>
    )
  }

  if (isLoading) {
    return <Spin />
  }

  const columns: ColumnsType<UserType> = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      ...getColumnSearchProps({ title: 'id', type: 'number' }),
      render: (value: number) => highlightSearchMatch(value, query?.id)
    },
    {
      title: 'Пользователь',
      dataIndex: 'userId',
      key: 'userId',
      sorter: true,
      ...getColumnSearchProps({
        title: 'Пользователь',
        type: 'select',
        options: userOptions.map((user) => ({
          value: user.id,
          label: getUserFullName(user)
        }))
      }),
      render: (_, record) => getUserFullName(record)
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      sorter: true,
      ...getColumnSearchProps({ title: 'Описание' }),
      render: (value: string) => highlightSearchMatch(value, query?.description)
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      ...getColumnSearchProps({ title: 'Email' }),
      render: (value: string, record) => {
        const email = highlightSearchMatch(value, query?.email)
        if (record.blocked) {
          return (
            <div>
              {email} <Tag color="red">Заблокирован</Tag>
            </div>
          )
        }

        return email
      }
    },
    {
      title: 'Роль',
      dataIndex: 'roles',
      key: 'roles',
      ...getColumnSearchProps({
        title: 'Роль',
        type: 'select',
        options:
          roles?.map(({ id, name }) => ({ value: id, label: name })) ?? []
      }),
      render: (values: number[]) => {
        return values.flatMap((id) => {
          const role = roles?.find((item) => item.id === id)
          if (!role) return []

          const selected =
            Array.isArray(searchedRoles) && searchedRoles.includes(id)
          return (
            <div key={id} className="role-item">
              {selected
                ? highlightSearchMatch(role.name, role.name)
                : role.name}
            </div>
          )
        })
      }
    },
    {
      title: 'Последняя сессия',
      dataIndex: 'lastSessionCreatedAt',
      key: 'lastSessionCreatedAt',
      sorter: true,
      ...getColumnSearchProps({ title: 'Последняя сессия', type: 'date' }),
      render: (value: string) =>
        value ? dayjs(value).format(dateFormats.fullFormat) : ''
    },
    {
      dataIndex: 'actions',
      key: 'actions',
      render: (_, record) => {
        return (
          <div className="users-page__content__table__actions">
            <Button.Group className="button_group">
              {hasBlockUserPermission && renderBlockButton(record)}
              {hasUpdateUserPermission && (
                <Tooltip key="EditOutlined" title="Редактировать пользователя">
                  <Button
                    data-cy={`users-page__content__table__actions__edit-btn ${record.id}`}
                    className="users-page__content__table__actions__edit-btn"
                    icon={<EditOutlined />}
                    onClick={() => {
                      navigate(`${routePaths.users}/${record.id}`, {
                        state: { ...record }
                      })
                    }}
                  />
                </Tooltip>
              )}
              {hasDeleteUserPermission && (
                <Popconfirm
                  title="Вы действительно хотите удалить этого пользователя?"
                  onConfirm={() => handleDeleteUser(record.id)}
                >
                  <Tooltip key="DeleteOutlined" title="Удалить пользователя">
                    <Button
                      data-cy={`users-page__content__table__actions__delete-btn ${record.id}`}
                      className="users-page__content__table__actions__delete-btn"
                      icon={<DeleteOutlined />}
                    />
                  </Tooltip>
                </Popconfirm>
              )}
            </Button.Group>
          </div>
        )
      }
    }
  ]

  return (
    <section className="users-page">
      <header className="users-page__header">
        <span
          data-cy="users-page__header__title"
          className="users-page__header__title"
        >
          Пользователи
        </span>
        {hasCreateUserPermission && (
          <Button
            disabled={!hasCreateUserPermission}
            onClick={() =>
              navigate(`${routePaths.users}/new`, { state: { fromApp: true } })
            }
            data-cy="users-page__header__addButton"
            type="primary"
            icon={<PlusSquareOutlined />}
          >
            Добавить
          </Button>
        )}
      </header>
      <section className="users-page__content">
        {(isUsersError || isSearchError) && (
          <Alert type="error" title="Не удалось загрузить пользователей" />
        )}
        <div className="users-page__content__wrap-table">
          <Table
            data-cy="users-page__content__table"
            rowKey={(record) => record.id}
            pagination={false}
            loading={isSearching}
            onChange={handleTableChange}
            dataSource={allUsers}
            columns={columns}
          />
        </div>
      </section>
    </section>
  )
}

export default UsersPage
