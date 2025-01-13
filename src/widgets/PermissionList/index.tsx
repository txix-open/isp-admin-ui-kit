import { Descriptions } from 'antd'
import { FC } from 'react'

import { PermissionListProps } from './permisiion-list.type.ts'

import './permission-list.scss'

const PermissionList: FC<PermissionListProps> = ({ permissions }) => {
  return (
    <Descriptions layout="vertical" className="permission-list">
      <Descriptions.Item label="Список разрешений">
        <ul>
          {permissions.map((permission, index) => {
            return <li key={`${permission}-${index}`}>{permission}</li>
          })}
        </ul>
      </Descriptions.Item>
    </Descriptions>
  )
}

export default PermissionList
