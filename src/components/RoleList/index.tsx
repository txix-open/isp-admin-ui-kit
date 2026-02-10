import { Descriptions, Spin } from 'antd'

import { RoleListProps } from '@components/RoleList/role-list.type'

import './role-list.scss'

const RoleList = ({ userRoles, isError = false, isLoading }: RoleListProps) => {
  if (isError) {
    return null
  }

  const roles = Array.isArray(userRoles) ? userRoles : []

  return (
    <Descriptions layout="vertical" className="role-list">
      <Descriptions.Item label="Список ролей">
        {isLoading ? (
          <Spin className="spin" />
        ) : roles.length > 0 ? (
          <ul>
            {roles.map((role) => (
              <li key={role}>{role}</li>
            ))}
          </ul>
        ) : (
          <span className="role-list__empty-text">Нет ролей</span>
        )}
      </Descriptions.Item>
    </Descriptions>
  )
}

export default RoleList
