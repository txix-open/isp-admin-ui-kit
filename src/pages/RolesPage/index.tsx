import { List, message, Spin, Tooltip } from 'antd'
import { Layout } from 'isp-ui-kit'
import { useEffect } from 'react'
import { UseFormSetError } from 'react-hook-form'
import {
  createSearchParams,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from 'react-router-dom'

import RolesContent from '@components/RolesContent'

import { filterFirstColumnItems } from '@utils/firstColumnUtils.ts'

import useRole from '@hooks/useRole.tsx'

import roleApi from '@services/roleService.ts'
import userServiceApi from '@services/userService.ts'

import { routePaths } from '@routes/routePaths.ts'

import { NewRoleType, PermissionKeysType, RoleType } from '@type/roles.type.ts'

import './roles-page.scss'
import { useAppDispatch } from '@hooks/redux.ts'
import { fetchProfile } from '@stores/redusers/ActionCreators.ts'

const { Column, EmptyData, NoData } = Layout

const RolesPage = () => {
  const { id: selectedItemId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const fromApp = location.state?.fromApp || false
  const { role, hasPermission } = useRole()
  const [searchParams, setSearchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const searchValue = searchParams.get('search') || ''
  const { data: permissionList = [], isLoading: isPermissionLoading } =
    userServiceApi.useGetAllPermissionsQuery()
  const { data = [], isLoading: isRolesLoading } = roleApi.useGetAllRolesQuery()
  const [createRole] = roleApi.useCreateRoleMutation()
  const [updateRole] = roleApi.useUpdateRoleMutation()
  const [removeRole] = roleApi.useRemoveRoleMutation()

  const isPageAvailable = hasPermission(PermissionKeysType.role_view)
  const isAddRolePermissions = hasPermission(PermissionKeysType.role_add)
  const isRemoveRolePermissions = hasPermission(PermissionKeysType.role_delete)
  const isLoading = isPermissionLoading || isRolesLoading

  const isNew = selectedItemId === 'new'

  useEffect(() => {
    if (!fromApp) {
      navigate(routePaths.roles)
    }
  }, [fromApp])

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

  const setSelectedItemId = (id: string): void => {
    navigate(
      {
        pathname: `${routePaths.roles}/${id}`,
        search: createSearchParams(searchParams).toString()
      },
      { replace: true, state: { fromApp: true } }
    )
  }

  const handleOnChangeSearchValue = (value: string): void => {
    setSearchParams((prev) => {
      if (!value) {
        prev.delete('search')
      } else {
        prev.set('search', value)
      }
      return prev
    })
  }

  const handeOnAddItem = () => setSelectedItemId('new')

  const handleUpdateRole = (
    formValue: RoleType | NewRoleType,
    setError: UseFormSetError<RoleType>
  ) => {
    updateRole(formValue as RoleType)
      .unwrap()
      .then(() => {
        dispatch(fetchProfile())
        message.success('Элемент успешно добавлен').then()
      })
      .catch((error) => {
        const { status } = error
        if (status === 409) {
          setError('name', {
            message: 'Роль с таким названием уже существует'
          })
        }
        message.error('Не удалось сохранить роль')
      })
  }

  const handleCreateRole = (
    formValue: NewRoleType,
    setError: UseFormSetError<NewRoleType>
  ) => {
    createRole(formValue)
      .unwrap()
      .then((res) => {
        message.success('Элемент успешно добавлен').then()
        setSelectedItemId(res.id.toString())
      })
      .catch((error) => {
        const { status } = error
        if (status === 409) {
          setError('name', {
            message: 'Роль с таким названием уже существует'
          })
        }
        message.error('Не удалось добавить роль').then()
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
      .catch(() => message.error('Не удалось удалить роль'))
  }

  if (isLoading) {
    return <Spin />
  }

  const currentRole = data
    ? data.find((item) => item.id.toString() === selectedItemId)
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
    if (isNew) {
      return (
        <RolesContent
          saveRole={handleCreateRole}
          permissions={permissionList}
          title="Добавить"
        />
      )
    }

    if (!selectedItemId) {
      return <EmptyData />
    }

    if (!currentRole) {
      return <NoData />
    }

    return (
      <RolesContent
        immutable={currentRole.immutable}
        saveRole={handleUpdateRole}
        permissions={permissionList}
        role={currentRole}
      />
    )
  }

  return (
    <section className="roles-page">
      <Column
        title="Роли пользователей"
        searchPlaceholder="Введите имя или id"
        showUpdateBtn={false}
        items={filterFirstColumnItems(data, searchValue)}
        showAddBtn={isAddRolePermissions}
        showRemoveBtn={isRemoveRolePermissions}
        onAddItem={handeOnAddItem}
        onRemoveItem={handleRemoveRole}
        onChangeSearchValue={handleOnChangeSearchValue}
        renderItems={renderItems}
        searchValue={searchValue}
        selectedItemId={selectedItemId}
        setSelectedItemId={setSelectedItemId}
      />
      <div className="roles-page__content">{renderMainContent()}</div>
    </section>
  )
}

export default RolesPage
