import { Alert, Button, List, message, Result, Spin, Tooltip } from 'antd'
import { Column, EmptyData, NoData } from 'isp-ui-kit'
import { UseFormSetError } from 'react-hook-form'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import PageLayout from '@components/PageLayout'
import RolesContent from '@components/RolesContent'

import { notifyApiError } from '@utils/apiErrorNotifications'
import { setUrlValue } from '@utils/columnLayoutUtils'
import { filterFirstColumnItems } from '@utils/firstColumnUtils'

import { useAppDispatch } from '@hooks/redux'
import useRole from '@hooks/useRole'

import roleApi from '@services/roleService'
import userServiceApi from '@services/userService'

import { fetchProfile } from '@stores/redusers/ActionCreators'

import { routePaths } from '@routes/routePaths'

import { NewRoleType, PermissionKeysType, RoleType } from '@type/roles.type'

import CreateRoleDrawer from './CreateRoleDrawer'
import './roles-page.scss'

const RolesPage = () => {
  const { id: selectedItemId = '' } = useParams()
  const navigate = useNavigate()
  const { hasPermission } = useRole()
  const isPageAvailable = hasPermission(PermissionKeysType.role_view)
  const [searchParams, setSearchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const searchValue = searchParams.get('search') || ''
  const sortValue = searchParams.get('sort') || ''
  const directionValue = searchParams.get('direction') || ''
  const permissionsQuery = userServiceApi.useGetAllPermissionsQuery(undefined, {
    skip: !isPageAvailable
  })
  const rolesQuery = roleApi.useGetAllRolesQuery(undefined, {
    skip: !isPageAvailable
  })
  const permissionList = permissionsQuery.data ?? []
  const data = rolesQuery.data ?? []
  const [createRole] = roleApi.useCreateRoleMutation()
  const [updateRole] = roleApi.useUpdateRoleMutation()
  const [removeRole] = roleApi.useRemoveRoleMutation()

  const isAddRolePermissions = hasPermission(PermissionKeysType.role_add)
  const isRemoveRolePermissions = hasPermission(PermissionKeysType.role_delete)
  const isLoading = permissionsQuery.isLoading || rolesQuery.isLoading
  const isFetching = permissionsQuery.isFetching || rolesQuery.isFetching
  const isError = permissionsQuery.isError || rolesQuery.isError
  const hasRequiredData =
    permissionsQuery.data !== undefined && rolesQuery.data !== undefined

  const isNew = selectedItemId === 'new'
  const isCreating = isNew || searchParams.get('create') === 'role'
  const selectedRoleId = isNew ? '' : selectedItemId

  const openRole = (id: string, replace = false): void => {
    const params = new URLSearchParams(searchParams)
    params.delete('create')
    navigate(
      {
        pathname: `${routePaths.roles}/${id}`,
        search: params.toString()
      },
      { replace }
    )
  }
  const setSelectedItemId = (id: string) => openRole(id)
  const goToList = () =>
    navigate({ pathname: routePaths.roles, search: searchParams.toString() })
  const closeCreate = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('create')
    if (isNew)
      navigate(
        { pathname: routePaths.roles, search: params.toString() },
        { replace: true }
      )
    else setSearchParams(params, { replace: true })
  }

  const handleOnChangeSearchValue = (value: string): void => {
    setUrlValue(value, setSearchParams, 'search')
  }

  const openCreate = () => {
    const params = new URLSearchParams(searchParams)
    params.set('create', 'role')
    setSearchParams(params)
  }

  const handleUpdateRole = (
    formValue: RoleType | NewRoleType,
    setError: UseFormSetError<RoleType>
  ) => {
    return updateRole(formValue as RoleType)
      .unwrap()
      .then(() => {
        dispatch(fetchProfile())
        message.success('Роль успешно сохранена').then()
        return true
      })
      .catch((error) => {
        const { status } = error
        if (status === 409) {
          setError('name', {
            message: 'Роль с таким названием уже существует'
          })
        }
        notifyApiError(error, 'Не удалось сохранить роль')
        return false
      })
  }

  const handleCreateRole = (
    formValue: NewRoleType,
    setError: UseFormSetError<NewRoleType>
  ) => {
    return createRole(formValue)
      .unwrap()
      .then((res) => {
        message.success('Роль успешно создана')
        openRole(res.id.toString(), true)
        return true
      })
      .catch((error) => {
        const { status } = error
        if (status === 409) {
          setError('name', {
            message: 'Роль с таким названием уже существует'
          })
        }
        notifyApiError(error, 'Не удалось добавить роль')
        return false
      })
  }

  const handleRemoveRole = (id: string) => {
    const idAsNumber = parseInt(id, 10)
    removeRole(idAsNumber)
      .unwrap()
      .then(() => {
        message.success('Элемент успешно удален').then()
        setSelectedItemId('')
      })
      .catch((error) => notifyApiError(error, 'Не удалось удалить роль'))
  }

  const retryLoading = () => {
    if (permissionsQuery.isError) void permissionsQuery.refetch()
    if (rolesQuery.isError) void rolesQuery.refetch()
  }

  if (!isPageAvailable) {
    return <Result status="403" title="Нет доступа к ролям пользователей" />
  }

  if (isLoading) {
    return (
      <Spin description="Загрузка ролей и прав">
        <div style={{ minHeight: 160 }} />
      </Spin>
    )
  }

  if (isError && !hasRequiredData) {
    return (
      <Result
        status="error"
        title="Не удалось загрузить роли и права"
        extra={
          <Button type="primary" onClick={retryLoading} loading={isFetching}>
            Повторить
          </Button>
        }
      />
    )
  }

  const currentRole = data
    ? data.find((item) => item.id.toString() === selectedRoleId)
    : null
  const renderItems = (item: RoleType) => (
    <List.Item data-cy="role-item">
      <Tooltip mouseEnterDelay={1} title={item.name}>
        <List.Item.Meta
          title={item.name}
          description={<span>id: {item.id}</span>}
        />
      </Tooltip>
    </List.Item>
  )

  const renderMainContent = () => {
    if (!selectedRoleId) {
      return <EmptyData />
    }

    if (!currentRole) {
      return (
        <NoData
          content={
            <Result
              status="404"
              title="Роль не найдена"
              subTitle="Возможно, роль была удалена. Выберите другую роль в списке."
            />
          }
        />
      )
    }

    return (
      <RolesContent
        key={selectedRoleId}
        immutable={currentRole.immutable}
        saveRole={handleUpdateRole}
        permissions={permissionList}
        role={currentRole}
      />
    )
  }

  return (
    <PageLayout
      split
      className="roles-screen"
      title="Роли пользователей"
      context="Пользователи и роли"
      description="Роли объединяют права доступа и назначаются пользователям."
      actions={
        isAddRolePermissions ? (
          <Button type="primary" onClick={openCreate}>
            Новая роль
          </Button>
        ) : undefined
      }
    >
      <section className="roles-page" data-selected={Boolean(selectedRoleId)}>
        <Column
          sortableFields={[
            { value: 'name', label: 'Наименование' },
            { value: 'id', label: 'Идентификатор' },
            { value: 'createdAt', label: 'Дата создания' },
            { value: 'updatedAt', label: 'Дата обновления' }
          ]}
          sortValue={sortValue as keyof RoleType}
          onChangeSortValue={(value) =>
            setUrlValue(value, setSearchParams, 'sort')
          }
          directionValue={directionValue}
          onChangeDirectionValue={(value) =>
            setUrlValue(value, setSearchParams, 'direction')
          }
          title="Список ролей"
          searchPlaceholder="Введите имя или id"
          showUpdateBtn={false}
          items={filterFirstColumnItems(data, searchValue)}
          showAddBtn={false}
          showRemoveBtn={isRemoveRolePermissions && !isNew}
          onAddItem={openCreate}
          onRemoveItem={handleRemoveRole}
          onChangeSearchValue={handleOnChangeSearchValue}
          renderItems={renderItems}
          searchValue={searchValue}
          selectedItemId={selectedRoleId}
          setSelectedItemId={setSelectedItemId}
        />
        <div className="roles-page__content">
          {selectedRoleId && (
            <Button className="roles-page__back-to-list" onClick={goToList}>
              К списку ролей
            </Button>
          )}
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
          {renderMainContent()}
        </div>
      </section>
      {isAddRolePermissions ? (
        <CreateRoleDrawer
          open={isCreating}
          onClose={closeCreate}
          permissions={permissionList}
          saveRole={handleCreateRole}
        />
      ) : (
        isCreating && <Result status="403" title="Нет права создавать роли" />
      )}
    </PageLayout>
  )
}

export default RolesPage
