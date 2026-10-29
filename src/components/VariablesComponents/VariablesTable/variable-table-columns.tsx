import { DeleteOutlined, EditOutlined, ExportOutlined } from '@ant-design/icons'
import { Button, Popconfirm, Space, TableColumnType, Tag, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import {
  Filters,
  Sorts
} from '@components/VariablesComponents/VariablesTable/variables-table.type'

import { useColumnSearch } from '@hooks/useColumnsSearch'
import useRole from '@hooks/useRole'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import { matchesVariableSearch } from './variableTableState'

const renderText = (value?: string) =>
  value ? (
    <Tooltip
      title={value}
      trigger={['hover', 'focus']}
      classNames={{ container: 'variables-table__tooltip' }}
    >
      <span className="variables-table__text" tabIndex={0}>
        {value}
      </span>
    </Tooltip>
  ) : (
    '—'
  )

export const useVariableColumns = (
  sortedInfo: Sorts,
  filteredInfo: Filters,
  onRemoveVariable: (name: string) => void | Promise<void>,
  removingName?: string
): TableColumnType<VariableType>[] => {
  const navigate = useNavigate()
  const { search } = useLocation()
  const { hasPermission } = useRole()
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
      align: 'left',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
      ...getColumnSearchProps('name', filteredInfo),
      render: (name: string) => (
        <Tooltip
          title={name}
          trigger={['hover', 'focus']}
          classNames={{ container: 'variables-table__tooltip' }}
        >
          <Link
            className="variables-table__name"
            to={{ pathname: `${routePaths.variables}/${name}`, search }}
          >
            {name}
          </Link>
        </Tooltip>
      )
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      align: 'left',
      width: 200,
      render: renderText
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
        return <Tag color={value === 'TEXT' ? 'green' : 'orange'}>{label}</Tag>
      }
    },
    {
      title: 'Значение',
      dataIndex: 'value',
      key: 'value',
      align: 'left',
      width: 200,
      ...getColumnSearchProps('value', filteredInfo),
      onFilter: (value, record) =>
        record.type === 'TEXT' &&
        matchesVariableSearch(record.value, String(value)),
      render: (_, record) =>
        record.type === 'SECRET' ? 'Скрыто' : renderText(record.value)
    },
    {
      title: 'Используется в конфигурациях',
      dataIndex: 'containsInConfigs',
      key: 'containsInConfigs',
      align: 'left',
      width: 200,
      render: (configs) => {
        if (!configs || configs.length === 0) {
          return 'Не используется'
        }
        return (
          <ul className="variables-table__configurations">
            {configs.map(
              (config: VariableType['containsInConfigs'][number]) => (
                <li
                  data-testid="variable-table-columns__list-element"
                  className="variable-table-columns__list-element"
                  key={config.id}
                >
                  {isModulesPageAvailable ? (
                    <Tooltip
                      title={`${config.name} — откроется в новой вкладке`}
                      trigger={['hover', 'focus']}
                      classNames={{ container: 'variables-table__tooltip' }}
                    >
                      <a
                        className="variables-table__configuration-link"
                        href={`/${config.moduleId}/configEditor/${config.id}`}
                        aria-label={`${config.name} — откроется в новой вкладке`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="variables-table__text">
                          {config.name}
                        </span>{' '}
                        <ExportOutlined aria-hidden />
                      </a>
                    </Tooltip>
                  ) : (
                    renderText(config.name)
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
      align: 'left',
      sorter: (a, b) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      sortOrder: sortedInfo.columnKey === 'createdAt' ? sortedInfo.order : null,
      render: (value) => (value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '—')
    },
    {
      title: 'Дата обновления',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 200,
      align: 'left',
      sorter: (a, b) =>
        dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      sortOrder: sortedInfo.columnKey === 'updatedAt' ? sortedInfo.order : null,
      render: (value) => (value ? dayjs(value).format('DD.MM.YYYY HH:mm') : '—')
    },
    {
      title: 'Действия',
      dataIndex: 'actions',
      key: 'actions',
      width: 150,
      align: 'right',
      render: (_, record) => {
        const isUsedInConfigs = Boolean(record.containsInConfigs?.length)
        return (
          <Space.Compact>
            {canEditPermission && (
              <Tooltip title="Редактировать переменную">
                <Button
                  data-testid="variables-table__edit-config-btn"
                  icon={<EditOutlined />}
                  aria-label={`Редактировать переменную ${record.name}`}
                  disabled={Boolean(removingName)}
                  onClick={() =>
                    navigate({
                      pathname: `${routePaths.variables}/${record.name}`,
                      search
                    })
                  }
                />
              </Tooltip>
            )}
            {canRemovePermission && (
              <Popconfirm
                disabled={isUsedInConfigs || Boolean(removingName)}
                title={`Удалить переменную ${record.name}?`}
                description="Это действие нельзя отменить."
                okText="Удалить"
                cancelText="Отмена"
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
                    aria-label={`Удалить переменную ${record.name}`}
                    danger
                    loading={removingName === record.name}
                    disabled={isUsedInConfigs || Boolean(removingName)}
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </Space.Compact>
        )
      }
    }
  ]
}
