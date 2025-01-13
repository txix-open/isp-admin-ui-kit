import { Descriptions, Spin } from 'antd'

import { RoleListProps } from '@components/RoleList/role-list.type.ts'

import roleApi from '@services/roleService.ts'

import './role-list.scss'

const RoleList = ({ userRoles }: RoleListProps) => {
  const { data: roles = [], isLoading, isError } = roleApi.useGetAllRolesQuery()
  const roleIds = new Set(userRoles)

  if (isError) {
    return null
  }

  return (
    <Descriptions layout="vertical" className="role-list">
      <Descriptions.Item label="Список ролей">
        {isLoading ? (
          <Spin className="spin" />
        ) : (
          <ul>
            {roles.map((roleData) => {
              if (roleIds.has(roleData.id) && roleData.name) {
                return <li key={roleData.id}>{roleData.name}</li>
              }
              return null
            })}
          </ul>
        )}
      </Descriptions.Item>
    </Descriptions>
  )
}

export default RoleList
