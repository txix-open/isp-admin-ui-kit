import { Alert, Button, Result, Spin } from 'antd'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import useRole from '@hooks/useRole'

import roleApi from '@services/roleService'
import userServiceApi from '@services/userService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import UserEditorForm from './UserEditorForm'

const UserEditor = () => {
  const { id = '' } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()
  const { search } = useLocation()
  const { hasPermission } = useRole()
  const canAccess = hasPermission(
    isNew ? PermissionKeysType.user_create : PermissionKeysType.user_view
  )

  const usersQuery = userServiceApi.useGetAllUsersQuery(undefined, {
    skip: isNew || !canAccess
  })
  const rolesQuery = roleApi.useGetAllRolesQuery(undefined, {
    skip: !canAccess
  })
  const user = usersQuery.data?.find((item) => item.id.toString() === id)
  const isLoading = rolesQuery.isLoading || (!isNew && usersQuery.isLoading)
  const isFetching = rolesQuery.isFetching || usersQuery.isFetching
  const isError = rolesQuery.isError || (!isNew && usersQuery.isError)
  const hasRequiredData =
    rolesQuery.data !== undefined && (isNew || usersQuery.data !== undefined)

  const goToUsers = () => navigate({ pathname: routePaths.users, search })
  const retryLoading = () => {
    if (rolesQuery.isError) void rolesQuery.refetch()
    if (!isNew && usersQuery.isError) void usersQuery.refetch()
  }

  if (!canAccess) {
    return <Result status="403" title="Нет доступа к этой странице" />
  }

  if (isLoading) {
    return (
      <Spin description="Загрузка пользователя и ролей">
        <div style={{ minHeight: 160 }} />
      </Spin>
    )
  }

  if (isError && !hasRequiredData) {
    return (
      <Result
        status="error"
        title="Не удалось загрузить данные редактора"
        subTitle="Попробуйте повторить запрос."
        extra={[
          <Button
            key="retry"
            type="primary"
            onClick={retryLoading}
            loading={isFetching}
          >
            Повторить
          </Button>,
          <Button key="back" onClick={goToUsers}>
            К пользователям
          </Button>
        ]}
      />
    )
  }

  if (!isNew && !user) {
    return (
      <Result
        status="404"
        title="Пользователь не найден в доступном списке"
        subTitle="Проверьте ссылку или вернитесь к списку пользователей."
        extra={<Button onClick={goToUsers}>К пользователям</Button>}
      />
    )
  }

  return (
    <>
      {isError && (
        <Alert
          type="warning"
          showIcon
          title="Не удалось обновить данные. Введённые изменения сохранены в форме."
          action={
            <Button onClick={retryLoading} loading={isFetching}>
              Повторить
            </Button>
          }
        />
      )}
      <UserEditorForm key={id} user={user} roles={rolesQuery.data ?? []} />
    </>
  )
}

export default UserEditor
