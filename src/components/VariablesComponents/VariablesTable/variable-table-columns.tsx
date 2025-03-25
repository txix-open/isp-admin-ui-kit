import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Popconfirm, TableColumnType, Tag, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'

import {
  Filters,
  Sorts
} from '@components/VariablesComponents/VariablesTable/variables-table.type.ts'

import { useColumnSearch } from '@hooks/useColumnsSearch'
import useRole from '@hooks/useRole.tsx'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type.ts'

export const getColumns = (
  sortedInfo: Sorts,
  filteredInfo: Filters,
  onRemoveVariable: (name: string) => void
): TableColumnType<VariableType>[] => {
  const navigate = useNavigate()
  const { role: _, hasPermission } = useRole()
  const { getColumnSearchProps } = useColumnSearch<VariableType>()
  const canEditPermission = hasPermission(PermissionKeysType.variable_edit)
  const canRemovePermission = hasPermission(PermissionKeysType.variable_delete)
  const isModulesPageAvailable = hasPermission(
    PermissionKeysType.module_configuration_edit
  )
  return [
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      align: 'center',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
      ...getColumnSearchProps('name', filteredInfo)
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      width: 200
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.type.localeCompare(b.type),
      sortOrder: sortedInfo.columnKey === 'type' ? sortedInfo.order : null,
      render: (value) => {
        const label = value === 'TEXT' ? 'ТЕКСТ' : 'СЕКРЕТ'
        return (
          <Tag
            data-testid="variables-table__clear-all-btn"
            color={value === 'TEXT' ? 'green' : 'orange'}
          >
            {label}
          </Tag>
        )
      }
    },
    {
      title: 'Значение',
      dataIndex: 'value',
      key: 'value',
      align: 'center',
      width: 200,
      ...getColumnSearchProps('value', filteredInfo),
      render: (_, record) => (record.type === 'SECRET' ? '****' : record.value)
    },
    {
      title: 'Используется в конфигурациях',
      dataIndex: 'containsInConfigs',
      key: 'containsInConfigs',
      align: 'center',
      width: 200,
      render: (configs) => {
        if (!configs || configs.length === 0) {
          return 'Не используется'
        }
        return (
          <ul>
            {configs.map(
              (config: VariableType['containsInConfigs'][number]) => (
                <li
                  data-testid="variable-table-columns__list-element"
                  className="variable-table-columns__list-element"
                  key={config.id}
                >
                  {isModulesPageAvailable ? (
                    <a
                      href={`${config.moduleId}/configEditor/${config.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {config.name}
                    </a>
                  ) : (
                    config.name
                  )}
                </li>
              )
            )}
          </ul>
        )
      }
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      align: 'center',
      sorter: (a, b) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      sortOrder: sortedInfo.columnKey === 'createdAt' ? sortedInfo.order : null,
      render: (value) => (value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '')
    },
    {
      title: 'Дата обновления',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 200,
      align: 'center',
      sorter: (a, b) =>
        dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      sortOrder: sortedInfo.columnKey === 'updatedAt' ? sortedInfo.order : null,
      render: (value) => (value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '')
    },
    {
      title: 'Действия',
      dataIndex: 'actions',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record) => {
        if (!canEditPermission) {
          return null
        }
        const isUsedInConfigs = record.containsInConfigs.length > 0
        return (
          <Button.Group>
            <Tooltip title="Редактировать переменную">
              <Button
                data-testid="variables-table__edit-config-btn"
                icon={<EditOutlined />}
                onClick={() =>
                  navigate(`${routePaths.variables}/${record.name}`)
                }
              />
            </Tooltip>
            {canRemovePermission && (
              <Popconfirm
                title="Вы уверены, что хотите удалить эту переменную?"
                onConfirm={() => onRemoveVariable(record.name)}
              >
                <Tooltip
                  title={
                    isUsedInConfigs
                      ? 'Переменная используется в конфигурациях'
                      : 'Удалить'
                  }
                >
                  <Button
                    data-testid="variables-table__delete-config-btn"
                    icon={<DeleteOutlined />}
                    disabled={isUsedInConfigs}
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </Button.Group>
        )
      }
    }
  ]
}
